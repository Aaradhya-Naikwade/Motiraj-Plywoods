import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type VendorStatus = "active" | "pending" | "blocked";

export type VendorDocument = {
  _id: ObjectId;
  name: string;
  company_name: string;
  mobile: string;
  whatsapp_number: string | null;
  email: string;
  password_hash: string;
  password_salt: string;
  status: VendorStatus;
  created_at: Date;
  last_login: Date | null;
};

type CreateVendorInput = {
  name: string;
  company_name: string;
  mobile: string;
  whatsapp_number?: string | null;
  email: string;
  password_hash: string;
  password_salt: string;
  status?: VendorStatus;
};

type VendorDbDocument = Omit<VendorDocument, "_id"> & { _id?: ObjectId };

let indexesReadyPromise: Promise<void> | null = null;

async function ensureVendorIndexes(): Promise<void> {
  if (!indexesReadyPromise) {
    indexesReadyPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<VendorDbDocument>("vendors");
      const existingIndexes = await collection.indexes();
      const legacySparseEmailIndex = existingIndexes.find(
        (index) =>
          index.key?.email === 1 &&
          index.unique === true &&
          (index as { sparse?: boolean }).sparse === true
      );

      if (legacySparseEmailIndex?.name) {
        await collection.dropIndex(legacySparseEmailIndex.name);
      }

      const mobileIndex = existingIndexes.find((index) => index.key?.mobile === 1);
      const hasCompatibleMobileIndex =
        mobileIndex &&
        mobileIndex.unique === true &&
        (mobileIndex as { sparse?: boolean }).sparse !== true;

      if (!hasCompatibleMobileIndex) {
        if (mobileIndex?.name) {
          await collection.dropIndex(mobileIndex.name);
        }
        await collection.createIndex(
          { mobile: 1 },
          { unique: true, name: "vendors_mobile_unique_idx" }
        );
      }

      const emailIndex = existingIndexes.find((index) => index.key?.email === 1);
      const hasCompatibleEmailIndex =
        emailIndex &&
        emailIndex.unique === true &&
        (emailIndex as { sparse?: boolean }).sparse !== true;

      if (!hasCompatibleEmailIndex) {
        if (emailIndex?.name) {
          await collection.dropIndex(emailIndex.name);
        }
        await collection.createIndex(
          { email: 1 },
          { unique: true, name: "vendors_email_unique_idx" }
        );
      }
    })();
  }
  return indexesReadyPromise;
}

async function getVendorCollection() {
  await ensureVendorIndexes();
  const db = await getDb();
  return db.collection<VendorDbDocument>("vendors");
}

export async function findVendorByMobile(mobile: string): Promise<VendorDocument | null> {
  const collection = await getVendorCollection();
  const doc = await collection.findOne({ mobile });
  if (!doc?._id) {
    return null;
  }
  return doc as VendorDocument;
}

export async function findVendorById(id: string): Promise<VendorDocument | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await getVendorCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc?._id) {
    return null;
  }
  return doc as VendorDocument;
}

export async function findVendorsByIds(ids: string[]): Promise<VendorDocument[]> {
  const objectIds = ids
    .filter((id, index, arr) => arr.indexOf(id) === index)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  if (objectIds.length === 0) {
    return [];
  }

  const collection = await getVendorCollection();
  return collection.find({ _id: { $in: objectIds } }).toArray() as Promise<VendorDocument[]>;
}

export async function createVendor(input: CreateVendorInput): Promise<VendorDocument> {
  const collection = await getVendorCollection();
  const now = new Date();

  const doc: VendorDbDocument = {
    ...input,
    whatsapp_number: input.whatsapp_number ?? null,
    status: input.status ?? "active",
    created_at: now,
    last_login: null,
  };

  const result = await collection.insertOne(doc);
  return { _id: result.insertedId, ...doc } as VendorDocument;
}

export async function updateVendorLastLogin(vendorId: string, at = new Date()): Promise<void> {
  if (!ObjectId.isValid(vendorId)) {
    return;
  }
  const collection = await getVendorCollection();
  await collection.updateOne({ _id: new ObjectId(vendorId) }, { $set: { last_login: at } });
}

export async function updateVendorProfile(
  vendorId: string,
  profile: { name: string; company_name: string; whatsapp_number: string | null }
): Promise<void> {
  if (!ObjectId.isValid(vendorId)) {
    return;
  }

  const collection = await getVendorCollection();
  await collection.updateOne(
    { _id: new ObjectId(vendorId) },
    {
      $set: {
        name: profile.name,
        company_name: profile.company_name,
        whatsapp_number: profile.whatsapp_number,
      },
    }
  );
}
