import {
  PrismaClient,
  PrismaPromise,
  Delta as PrismaDelta,
  Player as PrismaPlayer,
  Record as PrismaRecord,
  Snapshot as PrismaSnapshot,
  Achievement as PrismaAchievement,
  TrendDatapoint as PrismaTrendDatapoint,
  Patron,
  Competition as PrismaCompetition,
  Participation,
  NameChange as PrismaNameChange,
  Group as PrismaGroup,
  PlayerArchive,
  Membership,
  Prisma,
  Country,
  MemberActivity,
  GroupSocialLinks as PrismaGroupSocialLinks,
  GroupRoleOrder,
  PlayerAnnotationType,
  PlayerAnnotation
} from '@prisma/client';
import { DenyContext, SkipContext, isComputedMetric } from '../utils';
import { NameChangeStatus } from './enum-adapter';

// @ts-expect-error - This is a polyfill for BigInt support in JSON
BigInt.prototype.toJSON = function () {
  return parseBigInt(this as unknown as bigint);
};

function parseBigInt(bigint: bigint): number {
  return parseInt(bigint.toString());
}

const prisma = new PrismaClient();

const extendedClient = prisma
  .$extends({
    model: {
      player: {
        // This is shit code
        // We shouldn't be omitting "latestSnapshotId" from the player result.
        // Instead, we should be using renderers/formatters to prevent leaking "omitted" fields into public responses
        // But for now, this is a way to get latestSnapshotId into the player result
        findPreExtension: async (args: Parameters<typeof prisma.player.findFirst>[0]) => {
          return prisma.player.findFirst(args);
        }
      }
    }
  })
  .$extends({
    result: {
      record: {
        value: {
          needs: { metric: true, value: true },
          compute({ value, metric }) {
            return isComputedMetric(metric) ? parseBigInt(value) / 10_000 : parseBigInt(value);
          }
        }
      },
      achievement: {
        threshold: {
          needs: { threshold: true },
          compute({ threshold }) {
            return parseBigInt(threshold);
          }
        },
        accuracy: {
          needs: { accuracy: true },
          compute({ accuracy }) {
            return accuracy == null ? null : parseBigInt(accuracy);
          }
        }
      },
      snapshot: {
        overallExperience: {
          needs: { overallExperience: true },
          compute({ overallExperience }) {
            return parseBigInt(overallExperience);
          }
        }
      },
      delta: {
        overall: {
          needs: { overall: true },
          compute({ overall }) {
            return parseBigInt(overall);
          }
        }
      },
      player: {
        exp: {
          needs: { exp: true },
          compute({ exp }) {
            return parseBigInt(exp);
          }
        },
        latestSnapshotId: {
          needs: {},
          compute() {
            return undefined;
          }
        }
      },
      trendDatapoint: {
        sum: {
          needs: { sum: true },
          compute({ sum }) {
            return parseBigInt(sum);
          }
        },
        maxValue: {
          needs: { maxValue: true },
          compute({ maxValue }) {
            return parseBigInt(maxValue);
          }
        }
      },
      group: {
        creatorIpHash: {
          compute() {
            return undefined;
          }
        }
      },
      competition: {
        creatorIpHash: {
          compute() {
            return undefined;
          }
        }
      },
      groupSocialLinks: {
        id: {
          compute() {
            return undefined;
          }
        },
        groupId: {
          compute() {
            return undefined;
          }
        },
        createdAt: {
          compute() {
            return undefined;
          }
        },
        updatedAt: {
          compute() {
            return undefined;
          }
        }
      }
    }
  });

type Achievement = Omit<PrismaAchievement, 'threshold' | 'accuracy'> & {
  threshold: number;
  accuracy: number | null;
};

type Record = Omit<PrismaRecord, 'value'> & {
  value: number;
};

type Delta = Omit<PrismaDelta, 'overall'> & {
  overall: number;
};

type Snapshot = Omit<PrismaSnapshot, 'overallExperience'> & {
  overallExperience: number;
};

type TrendDatapoint = Omit<PrismaTrendDatapoint, 'sum' | 'maxValue'> & {
  sum: number;
  maxValue: number;
};

type Player = Omit<PrismaPlayer, 'exp' | 'latestSnapshotId'> & {
  exp: number;
};

type Group = Omit<PrismaGroup, 'creatorIpHash'>;

type Competition = Omit<PrismaCompetition, 'creatorIpHash'>;

type NameChange = Omit<PrismaNameChange, 'reviewContext'> & {
  reviewContext: SkipContext | DenyContext | null;
};

type GroupSocialLinks = Omit<PrismaGroupSocialLinks, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>;

export {
  Prisma as PrismaTypes,
  PrismaPromise,
  // Models
  NameChange,
  Patron,
  Group,
  Membership,
  Competition,
  Participation,
  PlayerArchive,
  Player,
  Delta,
  Record,
  Snapshot,
  Achievement,
  MemberActivity,
  GroupSocialLinks,
  TrendDatapoint,
  GroupRoleOrder,
  PlayerAnnotation,
  // Enums
  PlayerAnnotationType,
  Country,
  NameChangeStatus
};

export default extendedClient;
