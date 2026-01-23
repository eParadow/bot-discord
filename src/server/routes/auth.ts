import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { authenticateJWT } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { loginSchema } from '../../common/schemas/auth.schema';
import { getUserByUsername, verifyPassword } from '../../common/database/users';
import type { LoginRequest, LoginResponse } from '../../common/types';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                         username:
 *                           type: string
 *       401:
 *         description: Identifiants invalides
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request<{}, LoginResponse, LoginRequest>, res: Response) => {
    try {
      const { username, password } = req.body;

      const user = await getUserByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const isValidPassword = await verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Generate JWT token (24h expiration)
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
        },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     username:
 *                       type: string
 *       401:
 *         description: Non autorisé
 */
router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      id: req.user!.userId,
      username: req.user!.username,
    },
  });
});

export default router;
