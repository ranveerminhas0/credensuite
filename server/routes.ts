import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertNgoSettingsSchema, insertCardTemplateSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating upload directory:', error);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Member routes
  app.get('/api/members', async (req, res) => {
    try {
      const { search } = req.query;
      let members;
      
      if (search && typeof search === 'string') {
        members = await storage.searchMembers(search);
      } else {
        members = await storage.getMembers();
      }
      
      res.json(members);
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ message: 'Failed to fetch members' });
    }
  });

  app.get('/api/members/:id', async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      res.json(member);
    } catch (error) {
      console.error('Error fetching member:', error);
      res.status(500).json({ message: 'Failed to fetch member' });
    }
  });

  app.post('/api/members', upload.single('photo'), async (req, res) => {
    try {
      const memberData = {
        ...req.body,
        joiningDate: new Date(req.body.joiningDate),
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
      };

      if (req.file) {
        memberData.photoUrl = `/uploads/${req.file.filename}`;
      }

      const validatedData = insertMemberSchema.parse(memberData);
      const member = await storage.createMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      console.error('Error creating member:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: 'Failed to create member', error: message });
    }
  });

  app.patch('/api/members/:id', upload.single('photo'), async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      if (req.body.joiningDate) {
        updateData.joiningDate = new Date(req.body.joiningDate);
      }
      
      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
      }

      if (req.file) {
        updateData.photoUrl = `/uploads/${req.file.filename}`;
      }

      const member = await storage.updateMember(req.params.id, updateData);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      res.json(member);
    } catch (error) {
      console.error('Error updating member:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: 'Failed to update member', error: message });
    }
  });

  app.delete('/api/members/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteMember(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Member not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting member:', error);
      res.status(500).json({ message: 'Failed to delete member' });
    }
  });

  // NGO Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getNgoSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  app.patch('/api/settings', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files.logo && files.logo[0]) {
          updateData.logoUrl = `/uploads/${files.logo[0].filename}`;
        }
        if (files.signature && files.signature[0]) {
          updateData.signatureUrl = `/uploads/${files.signature[0].filename}`;
        }
      }

      const validatedData = insertNgoSettingsSchema.parse(updateData);
      const settings = await storage.updateNgoSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: 'Failed to update settings', error: message });
    }
  });

  // Template routes
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  app.post('/api/templates', async (req, res) => {
    try {
      const validatedData = insertCardTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: 'Failed to create template', error: message });
    }
  });

  app.patch('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error updating template:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: 'Failed to update template', error: message });
    }
  });

  app.patch('/api/templates/:id/activate', async (req, res) => {
    try {
      const success = await storage.setActiveTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json({ message: 'Template activated successfully' });
    } catch (error) {
      console.error('Error activating template:', error);
      res.status(500).json({ message: 'Failed to activate template' });
    }
  });

  app.delete('/api/templates/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ message: 'Failed to delete template' });
    }
  });

  // Stats route for dashboard
  app.get('/api/stats', async (req, res) => {
    try {
      const members = await storage.getMembers();
      const activeMembers = members.filter(m => m.isActive);
      
      const stats = {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        cardsGenerated: Math.floor(members.length * 0.8), // Simulated
        downloadsToday: Math.floor(Math.random() * 100), // Simulated
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
