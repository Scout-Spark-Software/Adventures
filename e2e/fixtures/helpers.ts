import type { Page } from '@playwright/test';

export function getHikeId() {
  const id = process.env.TEST_HIKE_ID;
  if (!id) throw new Error('TEST_HIKE_ID not set in .env.test');
  return id;
}

export function getCampingId() {
  const id = process.env.TEST_CAMPING_ID;
  if (!id) throw new Error('TEST_CAMPING_ID not set in .env.test');
  return id;
}
