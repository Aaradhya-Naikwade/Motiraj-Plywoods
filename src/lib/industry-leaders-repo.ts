import { getDb } from "@/lib/mongodb";

export type IndustryLeaderRole = "president" | "secretary" | "top_performer";

export type IndustryLeader = {
  role: IndustryLeaderRole;
  name: string;
  designation: string;
  message: string;
  image_url: string;
};

type IndustryLeadersDocument = {
  _id: "industry_leaders";
  leaders: IndustryLeader[];
  updated_at: Date;
};

export const INDUSTRY_LEADER_ROLE_ORDER: IndustryLeaderRole[] = [
  "president",
  "secretary",
  "top_performer",
];

function sortLeaders(leaders: IndustryLeader[]): IndustryLeader[] {
  const rank = new Map(INDUSTRY_LEADER_ROLE_ORDER.map((role, index) => [role, index]));
  return [...leaders].sort((a, b) => (rank.get(a.role) ?? 99) - (rank.get(b.role) ?? 99));
}

function normalizeLeaders(leaders: IndustryLeader[]): IndustryLeader[] {
  const uniqueByRole = new Map<IndustryLeaderRole, IndustryLeader>();
  for (const leader of leaders) {
    if (!INDUSTRY_LEADER_ROLE_ORDER.includes(leader.role)) {
      continue;
    }
    uniqueByRole.set(leader.role, {
      role: leader.role,
      name: leader.name.trim(),
      designation: leader.designation.trim(),
      message: leader.message.trim(),
      image_url: leader.image_url.trim(),
    });
  }

  return sortLeaders(Array.from(uniqueByRole.values()));
}

function getPlaceholderLeaders(): IndustryLeader[] {
  return INDUSTRY_LEADER_ROLE_ORDER.map((role) => ({
    role,
    name: "",
    designation: "",
    message: "",
    image_url: "",
  }));
}

export async function getIndustryLeadersForAdmin(): Promise<IndustryLeader[]> {
  const leaders = await getIndustryLeaders();
  const byRole = new Map(leaders.map((leader) => [leader.role, leader]));

  return INDUSTRY_LEADER_ROLE_ORDER.map((role) => {
    const value = byRole.get(role);
    return value ?? { role, name: "", designation: "", message: "", image_url: "" };
  });
}

async function getIndustryLeadersCollection() {
  const db = await getDb();
  return db.collection<IndustryLeadersDocument>("site_content");
}

export async function getIndustryLeaders(): Promise<IndustryLeader[]> {
  const collection = await getIndustryLeadersCollection();
  const doc = await collection.findOne({ _id: "industry_leaders" });

  if (!doc?.leaders?.length) {
    return [];
  }

  return normalizeLeaders(doc.leaders);
}

export async function updateIndustryLeaders(leaders: IndustryLeader[]): Promise<void> {
  const collection = await getIndustryLeadersCollection();
  const normalized = normalizeLeaders(leaders);

  if (normalized.length === 0) {
    await collection.updateOne(
      { _id: "industry_leaders" },
      {
        $set: {
          leaders: getPlaceholderLeaders(),
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );
    return;
  }

  await collection.updateOne(
    { _id: "industry_leaders" },
    {
      $set: {
        leaders: normalized,
        updated_at: new Date(),
      },
    },
    { upsert: true }
  );
}
