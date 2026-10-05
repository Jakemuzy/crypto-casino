export default function Dashboard() {
  return <h1>Testing Login</h1>
  const user = await prisma.user.upsert({
    where: { logtoSub: sub },
    update: { lastLoginAt: new Date() },
    create: { logtoSub: sub, lastLoginAt: new Date() },
  });
}
