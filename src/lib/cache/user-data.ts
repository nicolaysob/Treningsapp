import { revalidateTag, updateTag } from "next/cache";

function userTag(userId: string) {
  return `user-${userId}`;
}

export function revalidateUserCache(userId: string) {
  revalidateTag(userTag(userId), "max");
}

export function invalidateUserCache(userId: string) {
  updateTag(userTag(userId));
}
