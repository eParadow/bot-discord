import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import {
  activityAlertCreateSchema,
  activityAlertUpdateSchema,
  activityAlertToggleSchema,
  activityAlertIdSchema,
} from '../../common/schemas/activity-alert.schema';
import {
  getAllEnabledActivityAlerts,
  getActivityAlertsByGuildId,
  getActivityAlertById,
  createActivityAlert,
  toggleActivityAlert,
  deleteActivityAlert,
} from '../../common/database/activity-alerts';
import type { ActivityAlert, ActivityAlertCreate } from '../../common/types';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /api/activity-alerts:
 *   get:
 *     summary: Liste toutes les alertes
 *     tags: [Activity Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: guild_id
 *         schema:
 *           type: string
 *         description: Filtrer par guild_id
 *       - in: query
 *         name: enabled
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut enabled
 *     responses:
 *       200:
 *         description: Liste des alertes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { guild_id, enabled } = req.query;
    
    let alerts;
    if (guild_id && typeof guild_id === 'string') {
      alerts = await getActivityAlertsByGuildId(guild_id);
    } else {
      alerts = await getAllEnabledActivityAlerts();
    }

    // Filter by enabled if specified
    if (enabled !== undefined) {
      const enabledBool = enabled === 'true';
      alerts = alerts.filter((alert) => alert.enabled === enabledBool);
    }

    return res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Get activity alerts error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/activity-alerts/{id}:
 *   get:
 *     summary: Récupère une alerte par ID
 *     tags: [Activity Alerts]
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
 *         description: Alerte trouvée
 *       404:
 *         description: Alerte non trouvée
 */
router.get(
  '/:id',
  validateParams(activityAlertIdSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const alert = await getActivityAlertById(id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Activity alert not found',
        });
      }

      return res.json({
        success: true,
        data: alert,
      });
    } catch (error) {
      console.error('Get activity alert error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * @swagger
 * /api/activity-alerts:
 *   post:
 *     summary: Crée une nouvelle alerte
 *     tags: [Activity Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target_user_id
 *               - alert_user_id
 *               - alert_type
 *             properties:
 *               guild_id:
 *                 type: string
 *                 nullable: true
 *               target_user_id:
 *                 type: string
 *               alert_user_id:
 *                 type: string
 *               alert_type:
 *                 type: string
 *                 enum: [gaming, voice, both]
 *               duration_minutes:
 *                 type: integer
 *                 default: 60
 *               message:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Alerte créée
 */
router.post(
  '/',
  validateBody(activityAlertCreateSchema),
  async (req: Request<{}, ActivityAlert, ActivityAlertCreate>, res: Response) => {
    try {
      const alert = await createActivityAlert(req.body);
      return res.status(201).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      console.error('Create activity alert error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * @swagger
 * /api/activity-alerts/{id}:
 *   put:
 *     summary: Met à jour une alerte
 *     tags: [Activity Alerts]
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
 *               target_user_id:
 *                 type: string
 *               alert_user_id:
 *                 type: string
 *               alert_type:
 *                 type: string
 *                 enum: [gaming, voice, both]
 *               duration_minutes:
 *                 type: integer
 *               message:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Alerte mise à jour
 *       404:
 *         description: Alerte non trouvée
 */
router.put(
  '/:id',
  validateParams(activityAlertIdSchema),
  validateBody(activityAlertUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const alert = await getActivityAlertById(id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Activity alert not found',
        });
      }

      // TODO: Implement update logic
      // For now, return not implemented
      return res.status(501).json({
        success: false,
        error: 'Update not implemented yet',
      });
    } catch (error) {
      console.error('Update activity alert error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * @swagger
 * /api/activity-alerts/{id}/toggle:
 *   patch:
 *     summary: Active ou désactive une alerte
 *     tags: [Activity Alerts]
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
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Alerte mise à jour
 *       404:
 *         description: Alerte non trouvée
 */
router.patch(
  '/:id/toggle',
  validateParams(activityAlertIdSchema),
  validateBody(activityAlertToggleSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const { enabled } = req.body;
      
      const alert = await getActivityAlertById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Activity alert not found',
        });
      }

      const updated = await toggleActivityAlert(
        id,
        alert.guild_id,
        enabled
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Activity alert not found',
        });
      }

      const updatedAlert = await getActivityAlertById(id);
      return res.json({
        success: true,
        data: updatedAlert,
      });
    } catch (error) {
      console.error('Toggle activity alert error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * @swagger
 * /api/activity-alerts/{id}:
 *   delete:
 *     summary: Supprime une alerte
 *     tags: [Activity Alerts]
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
 *         description: Alerte supprimée
 *       404:
 *         description: Alerte non trouvée
 */
router.delete(
  '/:id',
  validateParams(activityAlertIdSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const alert = await getActivityAlertById(id);
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Activity alert not found',
        });
      }

      const deleted = await deleteActivityAlert(
        id,
        alert.guild_id
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Activity alert not found',
        });
      }

      return res.json({
        success: true,
        message: 'Activity alert deleted',
      });
    } catch (error) {
      console.error('Delete activity alert error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

export default router;
