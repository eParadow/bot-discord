import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import {
  reminderCreateSchema,
  reminderUpdateSchema,
  reminderIdSchema,
} from '../../common/schemas/reminder.schema';
import {
  getAllReminders,
  getRemindersByGuildId,
  getReminderById,
  createReminder,
  deleteReminderById,
} from '../../common/database/reminders';
import type { Reminder, ReminderCreate } from '../../common/types';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: Liste tous les reminders
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: guild_id
 *         schema:
 *           type: string
 *         description: Filtrer par guild_id
 *     responses:
 *       200:
 *         description: Liste des reminders
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { guild_id } = req.query;
    
    let reminders;
    if (guild_id && typeof guild_id === 'string') {
      reminders = await getRemindersByGuildId(guild_id);
    } else {
      reminders = await getAllReminders();
    }

    return res.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/reminders/{id}:
 *   get:
 *     summary: Récupère un reminder par ID
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reminder trouvé
 *       404:
 *         description: Reminder non trouvé
 */
router.get(
  '/:id',
  validateParams(reminderIdSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const reminder = await getReminderById(id);

      if (!reminder) {
        return res.status(404).json({
          success: false,
          error: 'Reminder not found',
        });
      }

      return res.json({
        success: true,
        data: reminder,
      });
    } catch (error) {
      console.error('Get reminder error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * @swagger
 * /api/reminders:
 *   post:
 *     summary: Crée un nouveau reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - message
 *               - cron_expression
 *               - created_by
 *             properties:
 *               guild_id:
 *                 type: string
 *                 nullable: true
 *               user_id:
 *                 type: string
 *               message:
 *                 type: string
 *               cron_expression:
 *                 type: string
 *               created_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reminder créé
 */
router.post(
  '/',
  validateBody(reminderCreateSchema),
  async (req: Request<{}, Reminder, ReminderCreate>, res: Response) => {
    try {
      const reminder = await createReminder(req.body);
      return res.status(201).json({
        success: true,
        data: reminder,
      });
    } catch (error) {
      console.error('Create reminder error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * @swagger
 * /api/reminders/{id}:
 *   put:
 *     summary: Met à jour un reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guild_id:
 *                 type: string
 *                 nullable: true
 *               user_id:
 *                 type: string
 *               message:
 *                 type: string
 *               cron_expression:
 *                 type: string
 *               created_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reminder mis à jour
 *       404:
 *         description: Reminder non trouvé
 */
router.put(
  '/:id',
  validateParams(reminderIdSchema),
  validateBody(reminderUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const reminder = await getReminderById(id);

      if (!reminder) {
        return res.status(404).json({
          success: false,
          error: 'Reminder not found',
        });
      }

      // TODO: Implement update logic
      // For now, return not implemented
      return res.status(501).json({
        success: false,
        error: 'Update not implemented yet',
      });
    } catch (error) {
      console.error('Update reminder error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * @swagger
 * /api/reminders/{id}:
 *   delete:
 *     summary: Supprime un reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reminder supprimé
 *       404:
 *         description: Reminder non trouvé
 */
router.delete(
  '/:id',
  validateParams(reminderIdSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const deleted = await deleteReminderById(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Reminder not found',
        });
      }

      return res.json({
        success: true,
        message: 'Reminder deleted',
      });
    } catch (error) {
      console.error('Delete reminder error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

export default router;
