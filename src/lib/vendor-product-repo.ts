import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { VENDOR_PRODUCT_CATEGORY_KEYS, type VendorProductCategoryKey } from "@/lib/vendor-product-categories";

export type VendorProductDocument = {
  _id: ObjectId;
  vendor_id: ObjectId;
  category_key: VendorProductCategoryKey;
  image_name: string;
  image_url: string;
  hidden?: boolean;
  created_at: Date;
  updated_at: Date;
};

type VendorProductDbDocument = {
  _id?: ObjectId;
  vendor_id: ObjectId;
  category_key?: VendorProductCategoryKey;
  image_name?: string;
  image_url?: string;
  hidden?: boolean;
  created_at: Date;
  updated_at: Date;
  image_urls?: string[];
};

type CreateVendorProductsInput = {
  vendor_id: string;
  items: Array<{
    category_key: VendorProductCategoryKey;
    image_name: string;
    image_url: string;
  }>;
};

let indexesReadyPromise: Promise<void> | null = null;

async function ensureProductIndexes(): Promise<void> {
  if (!indexesReadyPromise) {
    indexesReadyPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<VendorProductDbDocument>("vendor_products");
      await collection.createIndex({ vendor_id: 1, created_at: -1 }, { name: "vendor_products_vendor_idx" });
      await collection.createIndex({ vendor_id: 1, category_key: 1, created_at: -1 }, { name: "vendor_products_vendor_category_idx" });
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

function normalizeProductDocument(doc: VendorProductDbDocument): VendorProductDocument | null {
  if (!doc._id || !doc.category_key || !doc.image_name || !doc.image_url) {
    return null;
  }

  return {
    _id: doc._id,
    vendor_id: doc.vendor_id,
    category_key: doc.category_key,
    image_name: doc.image_name,
    image_url: doc.image_url,
    hidden: doc.hidden ?? false,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export function getVendorProductImageUrls(product: Pick<VendorProductDocument, "image_url">): string[] {
  return product.image_url ? [product.image_url] : [];
}

export async function createVendorProducts(input: CreateVendorProductsInput): Promise<VendorProductDocument[]> {
  if (!ObjectId.isValid(input.vendor_id)) {
    throw new Error("Invalid vendor id.");
  }

  if (input.items.length === 0) {
    return [];
  }

  const collection = await getProductCollection();
  const now = new Date();
  const vendorId = new ObjectId(input.vendor_id);
  const docs: VendorProductDbDocument[] = input.items.map((item) => ({
    vendor_id: vendorId,
    category_key: item.category_key,
    image_name: item.image_name,
    image_url: item.image_url,
    hidden: false,
    created_at: now,
    updated_at: now,
  }));

  const result = await collection.insertMany(docs);
  return docs
    .map((doc, index) => normalizeProductDocument({ ...doc, _id: result.insertedIds[index] }))
    .filter((doc): doc is VendorProductDocument => doc !== null);
}

export async function findVendorProductsByVendorId(vendorId: string): Promise<VendorProductDocument[]> {
  if (!ObjectId.isValid(vendorId)) {
    return [];
  }

  const collection = await getProductCollection();
  const docs = await collection
    .find({ vendor_id: new ObjectId(vendorId), category_key: { $in: [...VENDOR_PRODUCT_CATEGORY_KEYS] } })
    .sort({ created_at: -1 })
    .toArray();
  return docs.map(normalizeProductDocument).filter((doc): doc is VendorProductDocument => doc !== null);
}

export async function findAllVendorProducts(): Promise<VendorProductDocument[]> {
  const collection = await getProductCollection();
  const docs = await collection
    .find({ category_key: { $in: [...VENDOR_PRODUCT_CATEGORY_KEYS] } })
    .sort({ created_at: -1 })
    .toArray();
  return docs.map(normalizeProductDocument).filter((doc): doc is VendorProductDocument => doc !== null);
}

export async function findVisibleVendorProducts(): Promise<VendorProductDocument[]> {
  const collection = await getProductCollection();
  const docs = await collection
    .find({
      category_key: { $in: [...VENDOR_PRODUCT_CATEGORY_KEYS] },
      $or: [{ hidden: { $exists: false } }, { hidden: false }],
    })
    .sort({ created_at: -1 })
    .toArray();

  return docs.map(normalizeProductDocument).filter((doc): doc is VendorProductDocument => doc !== null);
}

export async function findVisibleVendorProductsByVendorId(vendorId: string): Promise<VendorProductDocument[]> {
  if (!ObjectId.isValid(vendorId)) {
    return [];
  }

  const collection = await getProductCollection();
  const docs = await collection
    .find({
      vendor_id: new ObjectId(vendorId),
      category_key: { $in: [...VENDOR_PRODUCT_CATEGORY_KEYS] },
      $or: [{ hidden: { $exists: false } }, { hidden: false }],
    })
    .sort({ created_at: -1 })
    .toArray();

  return docs.map(normalizeProductDocument).filter((doc): doc is VendorProductDocument => doc !== null);
}

export async function findVendorProductById(productId: string): Promise<VendorProductDocument | null> {
  if (!ObjectId.isValid(productId)) {
    return null;
  }
  const collection = await getProductCollection();
  const doc = await collection.findOne({
    _id: new ObjectId(productId),
    category_key: { $in: [...VENDOR_PRODUCT_CATEGORY_KEYS] },
  });
  return doc ? normalizeProductDocument(doc) : null;
}

export async function deleteVendorProduct(productId: string, vendorId: string): Promise<VendorProductDocument | null> {
  if (!ObjectId.isValid(productId) || !ObjectId.isValid(vendorId)) {
    return null;
  }

  const collection = await getProductCollection();
  const doc = await collection.findOneAndDelete({
    _id: new ObjectId(productId),
    vendor_id: new ObjectId(vendorId),
    category_key: { $in: [...VENDOR_PRODUCT_CATEGORY_KEYS] },
  });
  return doc ? normalizeProductDocument(doc) : null;
}

export async function adminSetVendorProductHidden(productId: string, hidden: boolean): Promise<boolean> {
  if (!ObjectId.isValid(productId)) {
    return false;
  }

  const collection = await getProductCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(productId) },
    { $set: { hidden, updated_at: new Date() } }
  );

  return result.matchedCount > 0;
}

export async function adminSetVendorProductCategory(
  productId: string,
  categoryKey: VendorProductCategoryKey
): Promise<boolean> {
  if (!ObjectId.isValid(productId)) {
    return false;
  }

  const collection = await getProductCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(productId) },
    { $set: { category_key: categoryKey, updated_at: new Date() } }
  );

  return result.matchedCount > 0;
}

export async function adminDeleteVendorProduct(productId: string): Promise<VendorProductDocument | null> {
  if (!ObjectId.isValid(productId)) {
    return null;
  }

  const collection = await getProductCollection();
  const doc = await collection.findOneAndDelete({ _id: new ObjectId(productId) });
  return doc ? normalizeProductDocument(doc) : null;
}

export async function deleteVendorProductsByVendorId(vendorId: string): Promise<VendorProductDocument[]> {
  if (!ObjectId.isValid(vendorId)) {
    return [];
  }

  const collection = await getProductCollection();
  const docs = await collection
    .find({ vendor_id: new ObjectId(vendorId) })
    .toArray();

  if (docs.length === 0) {
    return [];
  }

  await collection.deleteMany({ vendor_id: new ObjectId(vendorId) });
  return docs.map(normalizeProductDocument).filter((doc): doc is VendorProductDocument => doc !== null);
}
