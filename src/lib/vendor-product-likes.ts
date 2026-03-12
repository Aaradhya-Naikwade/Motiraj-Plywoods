import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const VENDOR_CATALOGUE_VISITOR_COOKIE = "vendor_catalogue_visitor";

type VendorProductLikeDocument = {
  _id: ObjectId;
  product_id: ObjectId;
  vendor_id: ObjectId;
  visitor_id: string;
  created_at: Date;
};

type VendorProductLikeDbDocument = Omit<VendorProductLikeDocument, "_id"> & { _id?: ObjectId };

let indexesReadyPromise: Promise<void> | null = null;

async function ensureLikeIndexes() {
  if (!indexesReadyPromise) {
    indexesReadyPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<VendorProductLikeDbDocument>("vendor_product_likes");
      await collection.createIndex({ product_id: 1, visitor_id: 1 }, { unique: true, name: "vendor_product_likes_unique_idx" });
      await collection.createIndex({ vendor_id: 1, created_at: -1 }, { name: "vendor_product_likes_vendor_idx" });
      await collection.createIndex({ product_id: 1 }, { name: "vendor_product_likes_product_idx" });
    })();
  }

  return indexesReadyPromise;
}

async function getLikeCollection() {
  await ensureLikeIndexes();
  const db = await getDb();
  return db.collection<VendorProductLikeDbDocument>("vendor_product_likes");
}

export async function getLikeCountsByProductIds(productIds: string[]): Promise<Map<string, number>> {
  const validIds = productIds.filter((id, index, arr) => arr.indexOf(id) === index).filter((id) => ObjectId.isValid(id));
  if (validIds.length === 0) {
    return new Map();
  }

  const collection = await getLikeCollection();
  const rows = await collection
    .aggregate<{ _id: ObjectId; count: number }>([
      { $match: { product_id: { $in: validIds.map((id) => new ObjectId(id)) } } },
      { $group: { _id: "$product_id", count: { $sum: 1 } } },
    ])
    .toArray();

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

export async function getVisitorLikedProductIds(productIds: string[], visitorId: string): Promise<Set<string>> {
  const validIds = productIds.filter((id, index, arr) => arr.indexOf(id) === index).filter((id) => ObjectId.isValid(id));
  if (validIds.length === 0 || !visitorId) {
    return new Set();
  }

  const collection = await getLikeCollection();
  const docs = await collection
    .find({
      visitor_id: visitorId,
      product_id: { $in: validIds.map((id) => new ObjectId(id)) },
    })
    .toArray();

  return new Set(docs.map((doc) => doc.product_id.toString()));
}

export async function getTotalLikesByVendorIds(vendorIds: string[]): Promise<Map<string, number>> {
  const validIds = vendorIds.filter((id, index, arr) => arr.indexOf(id) === index).filter((id) => ObjectId.isValid(id));
  if (validIds.length === 0) {
    return new Map();
  }

  const collection = await getLikeCollection();
  const rows = await collection
    .aggregate<{ _id: ObjectId; count: number }>([
      { $match: { vendor_id: { $in: validIds.map((id) => new ObjectId(id)) } } },
      { $group: { _id: "$vendor_id", count: { $sum: 1 } } },
    ])
    .toArray();

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

export async function toggleVendorProductLike(input: {
  productId: string;
  vendorId: string;
  visitorId: string;
}): Promise<{ liked: boolean; count: number }> {
  if (!ObjectId.isValid(input.productId) || !ObjectId.isValid(input.vendorId) || !input.visitorId) {
    throw new Error("Invalid like payload.");
  }

  const collection = await getLikeCollection();
  const productObjectId = new ObjectId(input.productId);
  const vendorObjectId = new ObjectId(input.vendorId);

  const existing = await collection.findOne({
    product_id: productObjectId,
    vendor_id: vendorObjectId,
    visitor_id: input.visitorId,
  });

  if (existing?._id) {
    await collection.deleteOne({ _id: existing._id });
  } else {
    await collection.insertOne({
      product_id: productObjectId,
      vendor_id: vendorObjectId,
      visitor_id: input.visitorId,
      created_at: new Date(),
    });
  }

  const count = await collection.countDocuments({ product_id: productObjectId });
  return { liked: !existing?._id, count };
}
