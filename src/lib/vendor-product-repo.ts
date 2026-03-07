import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type VendorProductDocument = {
  _id: ObjectId;
  vendor_id: ObjectId;
  title: string;
  description: string;
  city: string;
  price: number | null;
  discount_percent: number | null;
  image_urls: string[];
  created_at: Date;
  updated_at: Date;
};

type VendorProductDbDocument = Omit<VendorProductDocument, "_id"> & { _id?: ObjectId };

type CreateVendorProductInput = {
  vendor_id: string;
  title: string;
  description: string;
  city: string;
  price: number | null;
  discount_percent: number | null;
  image_urls: string[];
};

type UpdateVendorProductInput = {
  title: string;
  description: string;
  city: string;
  price: number | null;
  discount_percent: number | null;
  image_urls: string[];
};

let indexesReadyPromise: Promise<void> | null = null;

async function ensureProductIndexes(): Promise<void> {
  if (!indexesReadyPromise) {
    indexesReadyPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<VendorProductDbDocument>("vendor_products");
      await collection.createIndex({ vendor_id: 1, created_at: -1 }, { name: "vendor_products_vendor_idx" });
      await collection.createIndex({ created_at: -1 }, { name: "vendor_products_created_idx" });
    })();
  }

  return indexesReadyPromise;
}

async function getProductCollection() {
  await ensureProductIndexes();
  const db = await getDb();
  return db.collection<VendorProductDbDocument>("vendor_products");
}

export async function createVendorProduct(input: CreateVendorProductInput): Promise<VendorProductDocument> {
  if (!ObjectId.isValid(input.vendor_id)) {
    throw new Error("Invalid vendor id.");
  }

  const collection = await getProductCollection();
  const now = new Date();
  const doc: VendorProductDbDocument = {
    vendor_id: new ObjectId(input.vendor_id),
    title: input.title,
    description: input.description,
    city: input.city,
    price: input.price,
    discount_percent: input.discount_percent,
    image_urls: input.image_urls,
    created_at: now,
    updated_at: now,
  };

  const result = await collection.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function findVendorProductsByVendorId(vendorId: string): Promise<VendorProductDocument[]> {
  if (!ObjectId.isValid(vendorId)) {
    return [];
  }

  const collection = await getProductCollection();
  const docs = await collection.find({ vendor_id: new ObjectId(vendorId) }).sort({ created_at: -1 }).toArray();
  return docs.filter((doc): doc is VendorProductDocument => Boolean(doc._id));
}

export async function findAllVendorProducts(): Promise<VendorProductDocument[]> {
  const collection = await getProductCollection();
  const docs = await collection.find({}).sort({ created_at: -1 }).toArray();
  return docs.filter((doc): doc is VendorProductDocument => Boolean(doc._id));
}

export async function findVendorProductById(productId: string): Promise<VendorProductDocument | null> {
  if (!ObjectId.isValid(productId)) {
    return null;
  }
  const collection = await getProductCollection();
  const doc = await collection.findOne({ _id: new ObjectId(productId) });
  if (!doc?._id) {
    return null;
  }
  return doc;
}

export async function updateVendorProduct(
  productId: string,
  vendorId: string,
  input: UpdateVendorProductInput
): Promise<boolean> {
  if (!ObjectId.isValid(productId) || !ObjectId.isValid(vendorId)) {
    return false;
  }

  const collection = await getProductCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(productId), vendor_id: new ObjectId(vendorId) },
    {
      $set: {
        title: input.title,
        description: input.description,
        city: input.city,
        price: input.price,
        discount_percent: input.discount_percent,
        image_urls: input.image_urls,
        updated_at: new Date(),
      },
    }
  );

  return result.matchedCount > 0;
}

export async function deleteVendorProduct(productId: string, vendorId: string): Promise<VendorProductDocument | null> {
  if (!ObjectId.isValid(productId) || !ObjectId.isValid(vendorId)) {
    return null;
  }

  const collection = await getProductCollection();
  const doc = await collection.findOneAndDelete({
    _id: new ObjectId(productId),
    vendor_id: new ObjectId(vendorId),
  });
  if (!doc?._id) {
    return null;
  }
  return doc;
}
