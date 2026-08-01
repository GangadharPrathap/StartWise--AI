import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
    if (!prisma) {
        return res.status(503).json({
            error: "Database not available. Set DATABASE_URL in .env to enable this feature."
        });
    }

    try {
        const {
            firebaseUid,
            email,
            title,
            description,
            industry,
            stage
        } = req.body;

        let user = await prisma.user.findUnique({
            where: {
                firebaseUid
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    firebaseUid,
                    email
                }
            });
        }

        const startup = await prisma.startup.create({
            data: {
                title,
                description,
                industry,
                stage,
                userId: user.id
            }
        });

        res.json(startup);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to save startup"
        });
    }
});

router.get("/:firebaseUid", async (req, res) => {
    if (!prisma) {
        return res.status(503).json({
            error: "Database not available. Set DATABASE_URL in .env to enable this feature."
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                firebaseUid: req.params.firebaseUid
            },
            include: {
                startups: {
                    include: {
                        analyses: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });

        res.json(user?.startups || []);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch startups"
        });
    }
});

export default router;