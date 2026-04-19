interface Env {
  APP_URL: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
    const res = await fetch(`${env.APP_URL}/api/cron/publish-posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`Scheduler failed: ${res.status}`, await res.text());
    } else {
      const data = (await res.json()) as { published: number };
      console.log(`Scheduler: published ${data.published} post(s)`);
    }
  },
};
