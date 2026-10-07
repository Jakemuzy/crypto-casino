import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "../app/logto";
import { db } from "./db";

export async function getCurrentUser() {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
  console.log("[getCurrentUser] auth:", { isAuthenticated, sub: claims?.sub });
  if (!isAuthenticated || !claims?.sub) return null;

  const user = await db.user.upsert({
    where: { logtoSub: claims.sub },
    update: {},
    create: { logtoSub: claims.sub },
  });
  console.log("[getCurrentUser] db user:", { id: user.id, status: user.status });

  return user.status === "active" ? user : null;
}
