import { test, expect } from './fixtures/base-test';
import { getHikeId } from './fixtures/helpers';

/**
 * Notes tests interact with the NotesSection component on the "My Notes" tab.
 * Notes use optimistic updates — the UI updates before the server responds.
 */

test.describe('Notes – authenticated user', () => {
  test.beforeEach(async ({ page }) => {
    // Clean up any existing notes for the test hike via the Notes tab
    const hikeId = getHikeId();
    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('load');

    // Navigate to the My Notes tab
    await page.locator('#tab-notes').click({ force: true });
    await page.waitForLoadState('load');

    // Delete all existing notes
    let deleteButtons = await page.getByRole('button', { name: 'Delete' }).all();
    while (deleteButtons.length > 0) {
      await deleteButtons[0].click();
      // Handle the confirmation modal
      const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Delete Note?' });
      await modal.waitFor({ state: 'visible', timeout: 3000 });
      await modal.getByRole('button', { name: 'Delete' }).click();
      await page.waitForLoadState('load');
      // Refresh the list of delete buttons
      deleteButtons = await page.getByRole('button', { name: 'Delete' }).all();
    }
  });

  test('adds a private note to a hike', async ({ page }) => {
    const hikeId = getHikeId();
    const noteContent = 'Bring extra water and sunscreen for this trail.';

    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('load');

    // Open the My Notes tab
    await page.locator('#tab-notes').dispatchEvent('click');
    await page.waitForLoadState('load');

    // Fill in the new note textarea
    const newNoteTextarea = page.locator('textarea[placeholder*="Write your note"]');
    await expect(newNoteTextarea).toBeVisible();
    await newNoteTextarea.fill(noteContent);

    // Click "Create Note"
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/notes') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Create Note' }).click(),
    ]);

    // The note content should appear in the notes list
    await expect(page.getByText(noteContent)).toBeVisible({ timeout: 5000 });
  });

  test('edits an existing note', async ({ page }) => {
    const hikeId = getHikeId();
    const originalContent = 'Original note content for editing test.';
    const updatedContent = 'Updated note content after editing.';

    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('load');

    // Open the My Notes tab
    await page.locator('#tab-notes').dispatchEvent('click');
    await page.waitForLoadState('load');

    // Create a note first
    const newNoteTextarea = page.locator('textarea[placeholder*="Write your note"]');
    await newNoteTextarea.fill(originalContent);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/notes') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Create Note' }).click(),
    ]);
    await expect(page.getByText(originalContent)).toBeVisible({ timeout: 5000 });

    // Click the Edit button on the note
    await page.getByRole('button', { name: 'Edit' }).first().click();

    // The edit textarea should now be visible (no placeholder — it's for editing)
    const editTextarea = page.locator('textarea').last();
    await expect(editTextarea).toBeVisible();
    await editTextarea.fill(updatedContent);

    // Save the edit
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/notes') && r.request().method() === 'PUT'),
      page.getByRole('button', { name: 'Save' }).click(),
    ]);

    // Updated content should be visible; original should be gone
    await expect(page.getByText(updatedContent)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(originalContent)).not.toBeVisible();
  });

  test('deletes a note', async ({ page }) => {
    const hikeId = getHikeId();
    const noteContent = 'This note will be deleted.';

    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('load');

    // Open the My Notes tab
    await page.locator('#tab-notes').dispatchEvent('click');
    await page.waitForLoadState('load');

    // Create a note
    const newNoteTextarea = page.locator('textarea[placeholder*="Write your note"]');
    await newNoteTextarea.fill(noteContent);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/notes') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Create Note' }).click(),
    ]);
    await expect(page.getByText(noteContent)).toBeVisible({ timeout: 5000 });

    // Click Delete to open the confirmation modal
    await page.getByRole('button', { name: 'Delete' }).first().click();

    // Confirmation modal should appear
    const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Delete Note?' });
    await expect(modal).toBeVisible();

    // Confirm deletion
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/notes') && r.request().method() === 'DELETE'),
      modal.getByRole('button', { name: 'Delete' }).click(),
    ]);

    // The note should no longer be visible
    await expect(page.getByText(noteContent)).not.toBeVisible({ timeout: 5000 });
  });
});
