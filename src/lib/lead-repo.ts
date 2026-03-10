import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type LeadDocument = {
  _id: ObjectId;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  status: "new" | "in_progress" | "contacted" | "closed";
  notes: string | null;
  created_at: Date;
};

type LeadDbDocument = Omit<LeadDocument, "_id"> & { _id?: ObjectId };

type CreateLeadInput = Omit<LeadDocument, "_id" | "created_at"> & { created_at?: Date };

async function getLeadCollection() {    
  const db = await getDb();
  return db.collection<LeadDbDocument>("contact_leads");
}

export async function createLead(input: CreateLeadInput): Promise<LeadDocument> {
  const collection = await getLeadCollection();
  const doc: LeadDbDocument = {
    ...input,
    status: input.status ?? "new",
    notes: input.notes ?? null,
    created_at: input.created_at ?? new Date(),
  };

  const result = await collection.insertOne(doc);
  return { _id: result.insertedId, ...doc } as LeadDocument;
}

export async function findAllLeads(): Promise<LeadDocument[]> {
  const collection = await getLeadCollection();
  const docs = await collection.find({}).sort({ created_at: -1 }).toArray();
  return docs
    .filter((doc): doc is LeadDocument => Boolean(doc._id))
    .map((doc) => ({
      ...doc,
      status: doc.status ?? "new",
      notes: doc.notes ?? null,
    }));
}

export async function updateLead(
  leadId: string,
  input: { status: LeadDocument["status"]; notes: string | null }
): Promise<boolean> {
  if (!ObjectId.isValid(leadId)) {
    return false;
  }

  const collection = await getLeadCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(leadId) },
    {
      $set: {
        status: input.status,
        notes: input.notes,
      },
    }
  );

  return result.matchedCount > 0;
}

export async function deleteLead(leadId: string): Promise<boolean> {
  if (!ObjectId.isValid(leadId)) {
    return false;
  }

  const collection = await getLeadCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(leadId) });
  return result.deletedCount > 0;
}
