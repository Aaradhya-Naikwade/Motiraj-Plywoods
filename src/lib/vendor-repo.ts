import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { buildVendorCatalogueSlug } from "@/lib/vendor-catalogue";

export type VendorStatus = "active" | "inactive" | "pending" | "blocked" | "locked";

export type VendorDocument = {
  _id: ObjectId;
  name: string;
  company_name: string;
  catalogue_slug: string;
  address: string | null;
  mobile: string;
  whatsapp_number: string | null;
  email: string;
  dob: Date | null;
  password_hash: string;
  password_salt: string;
  status: VendorStatus;
  catalogue_share_click_count: number;
  catalogue_view_count: number;
  last_shared_at: Date | null;
  last_viewed_at: Date | null;
  created_at: Date;
  renewal_started_at: Date | null;
  last_login: Date | null;
};

type CreateVendorInput = {
  name: string;
  company_name: string;
  address?: string | null;
  mobile: string;
  whatsapp_number?: string | null;
  email: string;
  dob?: Date | null;
  password_hash: string;
  password_salt: string;
  status?: VendorStatus;
};

type VendorDbDocument = Omit<VendorDocument, "_id"> & { _id?: ObjectId };

function normalizeVendorDocument(doc: VendorDbDocument & { _id: ObjectId }): VendorDocument {
  return {
    ...doc,
    catalogue_slug: doc.catalogue_slug || buildVendorCatalogueSlug(doc.company_name, doc.mobile),
    catalogue_share_click_count: doc.catalogue_share_click_count ?? 0,
    catalogue_view_count: doc.catalogue_view_count ?? 0,
    last_shared_at: doc.last_shared_at ?? null,
    last_viewed_at: doc.last_viewed_at ?? null,
  };
}

let indexesReadyPromise: Promise<void> | null = null;

async function ensureVendorIndexes(): Promise<void> {
  if (!indexesReadyPromise) {
    indexesReadyPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<VendorDbDocument>("vendors");
      const vendorsMissingCatalogueFields = await collection
        .find({
          $or: [
            { catalogue_slug: { $exists: false } },
            { catalogue_share_click_count: { $exists: false } },
            { catalogue_view_count: { $exists: false } },
            { last_shared_at: { $exists: false } },
            { last_viewed_at: { $exists: false } },
          ],
        })
        .toArray();

      await Promise.all(
        vendorsMissingCatalogueFields
          .filter((vendor): vendor is VendorDbDocument & { _id: ObjectId } => Boolean(vendor._id))
          .map((vendor) =>
            collection.updateOne(
              { _id: vendor._id },
              {
                $set: {
                  catalogue_slug: vendor.catalogue_slug || buildVendorCatalogueSlug(vendor.company_name, vendor.mobile),
                  catalogue_share_click_count: vendor.catalogue_share_click_count ?? 0,
                  catalogue_view_count: vendor.catalogue_view_count ?? 0,
                  last_shared_at: vendor.last_shared_at ?? null,
                  last_viewed_at: vendor.last_viewed_at ?? null,
                },
              }
            )
          )
      );

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

      const catalogueSlugIndex = existingIndexes.find((index) => index.key?.catalogue_slug === 1);
      const hasCompatibleCatalogueSlugIndex =
        catalogueSlugIndex &&
        catalogueSlugIndex.unique === true &&
        (catalogueSlugIndex as { sparse?: boolean }).sparse !== true;

      if (!hasCompatibleCatalogueSlugIndex) {
        if (catalogueSlugIndex?.name) {
          await collection.dropIndex(catalogueSlugIndex.name);
        }
        await collection.createIndex(
          { catalogue_slug: 1 },
          { unique: true, name: "vendors_catalogue_slug_unique_idx" }
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
  return normalizeVendorDocument(doc as VendorDbDocument & { _id: ObjectId });
}

export async function findVendorByEmail(email: string): Promise<VendorDocument | null> {
  const collection = await getVendorCollection();
  const doc = await collection.findOne({ email });
  if (!doc?._id) {
    return null;
  }
  return normalizeVendorDocument(doc as VendorDbDocument & { _id: ObjectId });
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
  return normalizeVendorDocument(doc as VendorDbDocument & { _id: ObjectId });
}

export async function findVendorByCatalogueSlug(slug: string): Promise<VendorDocument | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  const collection = await getVendorCollection();
  const doc = await collection.findOne({ catalogue_slug: normalizedSlug });
  if (!doc?._id) {
    return null;
  }
  return normalizeVendorDocument(doc as VendorDbDocument & { _id: ObjectId });
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
  const docs = await collection.find({ _id: { $in: objectIds } }).toArray();
  return docs
    .filter((doc): doc is VendorDbDocument & { _id: ObjectId } => Boolean(doc._id))
    .map(normalizeVendorDocument);
}

export async function findAllVendors(): Promise<VendorDocument[]> {
  const collection = await getVendorCollection();
  const docs = await collection.find({}).sort({ created_at: -1 }).toArray();
  return docs
    .filter((doc): doc is VendorDbDocument & { _id: ObjectId } => Boolean(doc._id))
    .map(normalizeVendorDocument);
}

export async function createVendor(input: CreateVendorInput): Promise<VendorDocument> {
  const collection = await getVendorCollection();
  const now = new Date();
  const catalogueSlug = buildVendorCatalogueSlug(input.company_name, input.mobile);

  const doc: VendorDbDocument = {
    ...input,
    catalogue_slug: catalogueSlug,
    address: input.address ?? null,
    whatsapp_number: input.whatsapp_number ?? null,
    dob: input.dob ?? null,
    status: input.status ?? "active",
    catalogue_share_click_count: 0,
    catalogue_view_count: 0,
    last_shared_at: null,
    last_viewed_at: null,
    created_at: now,
    renewal_started_at: now,
    last_login: null,
  };

  const result = await collection.insertOne(doc);
  return normalizeVendorDocument({ _id: result.insertedId, ...doc });
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
  profile: {
    name: string;
    company_name: string;
    address: string | null;
    whatsapp_number: string | null;
    email: string;
    dob: Date | null;
  }
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
        address: profile.address,
        whatsapp_number: profile.whatsapp_number,
        email: profile.email,
        dob: profile.dob,
      },
    }
  );
}

export async function incrementVendorCatalogueShareClick(vendorId: string): Promise<void> {
  if (!ObjectId.isValid(vendorId)) {
    return;
  }

  const collection = await getVendorCollection();
  await collection.updateOne(
    { _id: new ObjectId(vendorId) },
    {
      $inc: { catalogue_share_click_count: 1 },
      $set: { last_shared_at: new Date() },
    }
  );
}

export async function incrementVendorCatalogueView(vendorId: string): Promise<void> {
  if (!ObjectId.isValid(vendorId)) {
    return;
  }

  const collection = await getVendorCollection();
  await collection.updateOne(
    { _id: new ObjectId(vendorId) },
    {
      $inc: { catalogue_view_count: 1 },
      $set: { last_viewed_at: new Date() },
    }
  );
}

export async function adminUpdateVendor(
  vendorId: string,
  profile: {
    name: string;
    company_name: string;
    address: string | null;
    whatsapp_number: string | null;
    email: string;
    dob: Date | null;
    status: Extract<VendorStatus, "active" | "inactive" | "locked" | "pending">;
  }
): Promise<boolean> {
  if (!ObjectId.isValid(vendorId)) {
    return false;
  }

  const collection = await getVendorCollection();
  const existingVendor = await collection.findOne({ _id: new ObjectId(vendorId) });
  if (!existingVendor?._id) {
    return false;
  }

  const shouldResetRenewalWindow =
    existingVendor.status === "locked" && profile.status === "active";

  const result = await collection.updateOne(
    { _id: new ObjectId(vendorId) },
    {
      $set: {
        name: profile.name,
        company_name: profile.company_name,
        address: profile.address,
        whatsapp_number: profile.whatsapp_number,
        email: profile.email,
        dob: profile.dob,
        status: profile.status,
        ...(shouldResetRenewalWindow ? { renewal_started_at: new Date() } : {}),
      },
    }
  );

  return result.matchedCount > 0;
}

export async function setVendorStatus(vendorId: string, status: VendorStatus): Promise<boolean> {
  if (!ObjectId.isValid(vendorId)) {
    return false;
  }

  const collection = await getVendorCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(vendorId) },
    {
      $set: {
        status,
      },
    }
  );

  return result.matchedCount > 0;
}

export async function deleteVendorById(vendorId: string): Promise<VendorDocument | null> {
  if (!ObjectId.isValid(vendorId)) {
    return null;
  }

  const collection = await getVendorCollection();
  const doc = await collection.findOneAndDelete({ _id: new ObjectId(vendorId) });
  if (!doc?._id) {
    return null;
  }
  return normalizeVendorDocument(doc as VendorDbDocument & { _id: ObjectId });
}
