import type { CultivationRealm } from "../types/game";
import { calculateQiCap, calculateQiRequired } from "../utils/gameMath";

/**
 * Qi Cultivation Realms
 * 5 realms × 3 stages each (Early, Middle, Late)
 */
export const QI_REALMS: CultivationRealm[] = [
  // Mortal (Realm 0)
  {
    id: "qi_mortal",
    name: "Mortal",
    stage: 0,
    displayName: "Mortal",
    qiRequired: 0,
    qiCap: 1000,
    gainMultiplier: 1,
    baseSuccessRate: 0.9
  },
  // Realm 1: Qi Condensation
  {
    id: "qi_condensation_early",
    name: "Qi Condensation",
    stage: 0,
    displayName: "Qi Condensation (Early)",
    qiRequired: calculateQiRequired(1, 0),
    qiCap: calculateQiCap(1, 0),
    gainMultiplier: 2,
    baseSuccessRate: 0.85
  },
  {
    id: "qi_condensation_middle",
    name: "Qi Condensation",
    stage: 1,
    displayName: "Qi Condensation (Middle)",
    qiRequired: calculateQiRequired(1, 1),
    qiCap: calculateQiCap(1, 1),
    gainMultiplier: 2.3,
    baseSuccessRate: 0.8
  },
  {
    id: "qi_condensation_late",
    name: "Qi Condensation",
    stage: 2,
    displayName: "Qi Condensation (Late)",
    qiRequired: calculateQiRequired(1, 2),
    qiCap: calculateQiCap(1, 2),
    gainMultiplier: 2.7,
    baseSuccessRate: 0.75
  },
  // Realm 2: Foundation Establishment
  {
    id: "foundation_early",
    name: "Foundation Establishment",
    stage: 0,
    displayName: "Foundation Establishment (Early)",
    qiRequired: calculateQiRequired(2, 0),
    qiCap: calculateQiCap(2, 0),
    gainMultiplier: 3,
    baseSuccessRate: 0.75
  },
  {
    id: "foundation_middle",
    name: "Foundation Establishment",
    stage: 1,
    displayName: "Foundation Establishment (Middle)",
    qiRequired: calculateQiRequired(2, 1),
    qiCap: calculateQiCap(2, 1),
    gainMultiplier: 3.5,
    baseSuccessRate: 0.7
  },
  {
    id: "foundation_late",
    name: "Foundation Establishment",
    stage: 2,
    displayName: "Foundation Establishment (Late)",
    qiRequired: calculateQiRequired(2, 2),
    qiCap: calculateQiCap(2, 2),
    gainMultiplier: 4,
    baseSuccessRate: 0.65
  },
  // Realm 3: Core Formation
  {
    id: "core_formation_early",
    name: "Core Formation",
    stage: 0,
    displayName: "Core Formation (Early)",
    qiRequired: calculateQiRequired(3, 0),
    qiCap: calculateQiCap(3, 0),
    gainMultiplier: 5,
    baseSuccessRate: 0.65
  },
  {
    id: "core_formation_middle",
    name: "Core Formation",
    stage: 1,
    displayName: "Core Formation (Middle)",
    qiRequired: calculateQiRequired(3, 1),
    qiCap: calculateQiCap(3, 1),
    gainMultiplier: 6,
    baseSuccessRate: 0.6
  },
  {
    id: "core_formation_late",
    name: "Core Formation",
    stage: 2,
    displayName: "Core Formation (Late)",
    qiRequired: calculateQiRequired(3, 2),
    qiCap: calculateQiCap(3, 2),
    gainMultiplier: 7,
    baseSuccessRate: 0.55
  },
  // Realm 4: Nascent Soul
  {
    id: "nascent_soul_early",
    name: "Nascent Soul",
    stage: 0,
    displayName: "Nascent Soul (Early)",
    qiRequired: calculateQiRequired(4, 0),
    qiCap: calculateQiCap(4, 0),
    gainMultiplier: 10,
    baseSuccessRate: 0.55
  },
  {
    id: "nascent_soul_middle",
    name: "Nascent Soul",
    stage: 1,
    displayName: "Nascent Soul (Middle)",
    qiRequired: calculateQiRequired(4, 1),
    qiCap: calculateQiCap(4, 1),
    gainMultiplier: 12,
    baseSuccessRate: 0.5
  },
  {
    id: "nascent_soul_late",
    name: "Nascent Soul",
    stage: 2,
    displayName: "Nascent Soul (Late)",
    qiRequired: calculateQiRequired(4, 2),
    qiCap: calculateQiCap(4, 2),
    gainMultiplier: 15,
    baseSuccessRate: 0.45
  },
  // Realm 5: Spirit Severing
  {
    id: "spirit_severing_early",
    name: "Spirit Severing",
    stage: 0,
    displayName: "Spirit Severing (Early)",
    qiRequired: calculateQiRequired(5, 0),
    qiCap: calculateQiCap(5, 0),
    gainMultiplier: 20,
    baseSuccessRate: 0.45
  },
  {
    id: "spirit_severing_middle",
    name: "Spirit Severing",
    stage: 1,
    displayName: "Spirit Severing (Middle)",
    qiRequired: calculateQiRequired(5, 1),
    qiCap: calculateQiCap(5, 1),
    gainMultiplier: 25,
    baseSuccessRate: 0.4
  },
  {
    id: "spirit_severing_late",
    name: "Spirit Severing",
    stage: 2,
    displayName: "Spirit Severing (Late)",
    qiRequired: calculateQiRequired(5, 2),
    qiCap: calculateQiCap(5, 2),
    gainMultiplier: 30,
    baseSuccessRate: 0.35
  }
];

/**
 * Body Cultivation Realms
 * 5 realms × 3 stages each (Early, Middle, Late)
 */
export const BODY_REALMS: CultivationRealm[] = [
  // Mortal (Realm 0)
  {
    id: "body_mortal",
    name: "Mortal",
    stage: 0,
    displayName: "Mortal",
    qiRequired: 0,
    qiCap: 1000,
    gainMultiplier: 1,
    baseSuccessRate: 0.9
  },
  // Realm 1: Body Refining
  {
    id: "body_refining_early",
    name: "Body Refining",
    stage: 0,
    displayName: "Body Refining (Early)",
    qiRequired: calculateQiRequired(1, 0),
    qiCap: calculateQiCap(1, 0),
    gainMultiplier: 1.5,
    baseSuccessRate: 0.85
  },
  {
    id: "body_refining_middle",
    name: "Body Refining",
    stage: 1,
    displayName: "Body Refining (Middle)",
    qiRequired: calculateQiRequired(1, 1),
    qiCap: calculateQiCap(1, 1),
    gainMultiplier: 1.7,
    baseSuccessRate: 0.8
  },
  {
    id: "body_refining_late",
    name: "Body Refining",
    stage: 2,
    displayName: "Body Refining (Late)",
    qiRequired: calculateQiRequired(1, 2),
    qiCap: calculateQiCap(1, 2),
    gainMultiplier: 2,
    baseSuccessRate: 0.75
  },
  // Realm 2: Body Tempering
  {
    id: "body_tempering_early",
    name: "Body Tempering",
    stage: 0,
    displayName: "Body Tempering (Early)",
    qiRequired: calculateQiRequired(2, 0),
    qiCap: calculateQiCap(2, 0),
    gainMultiplier: 2.5,
    baseSuccessRate: 0.75
  },
  {
    id: "body_tempering_middle",
    name: "Body Tempering",
    stage: 1,
    displayName: "Body Tempering (Middle)",
    qiRequired: calculateQiRequired(2, 1),
    qiCap: calculateQiCap(2, 1),
    gainMultiplier: 3,
    baseSuccessRate: 0.7
  },
  {
    id: "body_tempering_late",
    name: "Body Tempering",
    stage: 2,
    displayName: "Body Tempering (Late)",
    qiRequired: calculateQiRequired(2, 2),
    qiCap: calculateQiCap(2, 2),
    gainMultiplier: 3.5,
    baseSuccessRate: 0.65
  },
  // Realm 3: Bone Forging
  {
    id: "bone_forging_early",
    name: "Bone Forging",
    stage: 0,
    displayName: "Bone Forging (Early)",
    qiRequired: calculateQiRequired(3, 0),
    qiCap: calculateQiCap(3, 0),
    gainMultiplier: 4,
    baseSuccessRate: 0.65
  },
  {
    id: "bone_forging_middle",
    name: "Bone Forging",
    stage: 1,
    displayName: "Bone Forging (Middle)",
    qiRequired: calculateQiRequired(3, 1),
    qiCap: calculateQiCap(3, 1),
    gainMultiplier: 4.5,
    baseSuccessRate: 0.6
  },
  {
    id: "bone_forging_late",
    name: "Bone Forging",
    stage: 2,
    displayName: "Bone Forging (Late)",
    qiRequired: calculateQiRequired(3, 2),
    qiCap: calculateQiCap(3, 2),
    gainMultiplier: 5,
    baseSuccessRate: 0.55
  },
  // Realm 4: Blood Transformation
  {
    id: "blood_transformation_early",
    name: "Blood Transformation",
    stage: 0,
    displayName: "Blood Transformation (Early)",
    qiRequired: calculateQiRequired(4, 0),
    qiCap: calculateQiCap(4, 0),
    gainMultiplier: 6,
    baseSuccessRate: 0.55
  },
  {
    id: "blood_transformation_middle",
    name: "Blood Transformation",
    stage: 1,
    displayName: "Blood Transformation (Middle)",
    qiRequired: calculateQiRequired(4, 1),
    qiCap: calculateQiCap(4, 1),
    gainMultiplier: 7,
    baseSuccessRate: 0.5
  },
  {
    id: "blood_transformation_late",
    name: "Blood Transformation",
    stage: 2,
    displayName: "Blood Transformation (Late)",
    qiRequired: calculateQiRequired(4, 2),
    qiCap: calculateQiCap(4, 2),
    gainMultiplier: 8,
    baseSuccessRate: 0.45
  },
  // Realm 5: Golden Body
  {
    id: "golden_body_early",
    name: "Golden Body",
    stage: 0,
    displayName: "Golden Body (Early)",
    qiRequired: calculateQiRequired(5, 0),
    qiCap: calculateQiCap(5, 0),
    gainMultiplier: 10,
    baseSuccessRate: 0.45
  },
  {
    id: "golden_body_middle",
    name: "Golden Body",
    stage: 1,
    displayName: "Golden Body (Middle)",
    qiRequired: calculateQiRequired(5, 1),
    qiCap: calculateQiCap(5, 1),
    gainMultiplier: 12,
    baseSuccessRate: 0.4
  },
  {
    id: "golden_body_late",
    name: "Golden Body",
    stage: 2,
    displayName: "Golden Body (Late)",
    qiRequired: calculateQiRequired(5, 2),
    qiCap: calculateQiCap(5, 2),
    gainMultiplier: 15,
    baseSuccessRate: 0.35
  }
];

/**
 * Helper to get current cultivation realm
 */
export const getCurrentRealm = (realms: CultivationRealm[], realmIndex: number, stage: number): CultivationRealm => {
  const index = realmIndex * 3 + stage;
  return realms[Math.min(index, realms.length - 1)];
};