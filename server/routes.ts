import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertNgoSettingsSchema, insertCardTemplateSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { verifyUser } from "./auth";
import { generateMemberPdf } from "./pdf";
import { getCollection } from "./db";
import { ObjectId } from "mongodb";

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
  async function seedWhitelistIfEmpty() {
    try {
      const col = await getCollection<{ email: string }>('whitlist_ids');
      const count = await col.countDocuments({} as any);
      if (count === 0) {
        await col.updateOne({ email: 'ranveerminhas34@gmail.com' }, { $set: { email: 'ranveerminhas34@gmail.com' } }, { upsert: true });
        await col.updateOne({ email: 'gouravminhas2k@gmail.com' }, { $set: { email: 'gouravminhas2k@gmail.com' } }, { upsert: true });
        console.log('[Whitelist] Seeded default emails into whitlist_ids');
      }
    } catch (e) {
      console.warn('[Whitelist] Seeding skipped:', (e as Error).message);
    }
  }
  function buildMemberFilter(id: string) {
    if (ObjectId.isValid(id)) {
      return {
        $or: [
          { _id: new ObjectId(id) },
          { _id: id },
          { id },
          { memberId: id },
        ],
      } as any;
    }
    return {
      $or: [
        { _id: id },
        { id },
        { memberId: id },
      ],
    } as any;
  }
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Ensure whitelist has the default emails on first run
  await seedWhitelistIfEmpty();

  // Health check endpoint (public - no auth required for Railway)
  app.get('/health', (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "Creden Suite Backend"
    });
  });

  // Protect all API routes below with Firebase auth and email whitelist
  app.use('/api', verifyUser);

  // Member routes
  app.get('/api/members', async (req, res) => {
    try {
      const { search, role, status, phone, joiningDate, emergencyName, emergencyPhone } = req.query as { 
        search?: string; 
        role?: string; 
        status?: string; 
        phone?: string; 
        joiningDate?: string; 
        emergencyName?: string;
        emergencyPhone?: string;
      };
      
      let members: any[] = [];
      
      if (phone && typeof phone === 'string') {
        members = await storage.searchMembersByPhone(phone);
      } else if (joiningDate && typeof joiningDate === 'string') {
        members = await storage.searchMembersByJoiningDate(joiningDate);
      } else if (emergencyName && typeof emergencyName === 'string') {
        members = await storage.searchMembersByEmergencyName(emergencyName);
      } else if (emergencyPhone && typeof emergencyPhone === 'string') {
        members = await storage.searchMembersByEmergencyPhone(emergencyPhone);
      } else if (search && typeof search === 'string') {
        members = await storage.searchMembers(search);
      } else {
        members = await storage.getMembers();
      }

      if (role && role !== 'all') {
        members = members.filter(m => m.designation === role);
      }
      if (status && status !== 'all') {
        members = members.filter(m => status === 'active' ? m.isActive : !m.isActive);
      }
      
      res.json(members);
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ message: 'Failed to fetch members' });
    }
  });

  // PDF generation (server-side) for a single member by id
  app.get('/api/pdf/members/:id', async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      const settings = await storage.getNgoSettings();

      const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const buffer = await generateMemberPdf(member, settings, baseUrl);
      // Record download event
      try {
        const downloads = await getCollection<{ ts: Date }>('downloads');
        await downloads.insertOne({ ts: new Date() } as any);
        const activities = await getCollection<{ ts: Date; type: string; by?: string; memberId?: string; memberName?: string }>('activities');
        const by = ((req as any)?.user?.email as string) || undefined;
        await activities.insertOne({ ts: new Date(), type: 'pdf_download', by, memberId: member.memberId, memberName: member.fullName } as any);
      } catch {}
      const filename = `id-card-${member.memberId || member.id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      res.end(buffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ message: 'Failed to generate PDF' });
    }
  });

  app.get('/api/members/:id', async (req, res) => {
    try {
      const col = await getCollection<any>('members');
      const member = await col.findOne(buildMemberFilter(req.params.id));
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
      console.log("Received member data:", req.body);
      console.log("Received file:", req.file);
      
      const memberData = {
        ...req.body,
        joiningDate: new Date(req.body.joiningDate),
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
      };

      console.log("Processed member data:", memberData);

      if (req.file) {
        memberData.photoUrl = `/uploads/${req.file.filename}`;
      }

      const validatedData = insertMemberSchema.parse(memberData);
      const member = await storage.createMember(validatedData);
      // Record activity: member added
      try {
        const activities = await getCollection<{ ts: Date; type: string; by?: string; memberName?: string; memberId?: string }>('activities');
        const by = ((req as any)?.user?.email as string) || undefined;
        await activities.insertOne({ ts: new Date(), type: 'member_added', by, memberName: member.fullName, memberId: member.memberId } as any);
      } catch {}
      res.status(201).json(member);
    } catch (error) {
      console.error('Error creating member:', error);
      const anyErr = error as any;
      
      // Handle Zod validation errors with user-friendly messages
      if (anyErr?.issues && Array.isArray(anyErr.issues)) {
        const missingFields = anyErr.issues
          .filter((issue: any) => issue.code === 'invalid_type' && issue.received === 'undefined')
          .map((issue: any) => {
            switch (issue.path[0]) {
              case 'fullName': return 'Full Name';
              case 'designation': return 'Designation/Role';
              case 'joiningDate': return 'Date of Joining';
              case 'contactNumber': return 'Contact Number';
              default: return issue.path[0];
            }
          });
        
        if (missingFields.length > 0) {
          res.status(400).json({ 
            message: 'Please fill in all required fields',
            details: `Missing: ${missingFields.join(', ')}`
          });
          return;
        }
      }
      
      // Fallback for other errors
      res.status(400).json({ 
        message: 'Failed to create member',
        details: anyErr?.message || 'Please check your input and try again'
      });
    }
  });

  app.patch('/api/members/:id', upload.single('photo'), async (req, res) => {
    try {
      const updateData: any = { ...req.body };

      if (req.body.joiningDate) {
        updateData.joiningDate = new Date(req.body.joiningDate);
      }

      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
      }

      if (req.file) {
        updateData.photoUrl = `/uploads/${req.file.filename}`;
      }

      // Update strictly by Mongo _id
      const id = req.params.id;
      const col = await getCollection<any>('members');
      const filter = buildMemberFilter(id);
      const write = await col.updateOne(filter, { $set: { ...updateData, updatedAt: new Date() } } as any);
      if (!write.matchedCount) {
        return res.status(404).json({ message: 'Member not found' });
      }
      const member = await col.findOne(filter);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      // Activity for status change
      try {
        if (Object.prototype.hasOwnProperty.call(updateData, 'isActive')) {
          const activities = await getCollection<{ ts: Date; type: string; by?: string; memberName?: string; memberId?: string }>('activities');
          const by = ((req as any)?.user?.email as string) || undefined;
          await activities.insertOne({ ts: new Date(), type: member.isActive ? 'member_activated' : 'member_deactivated', by, memberName: member.fullName, memberId: member.memberId } as any);
        }
      } catch {}
      res.json(member);
    } catch (error) {
      console.error('Error updating member:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: 'Failed to update member', error: message });
    }
  });

  // Toggle active/inactive strictly by _id
  app.post('/api/members/:id/toggle', async (req, res) => {
    try {
      const id = req.params.id;
      const col = await getCollection<any>('members');
      const filter = buildMemberFilter(id);
      const existing = await col.findOne(filter);
      if (!existing) return res.status(404).json({ message: 'Member not found' });
      const write = await col.updateOne({ _id: existing._id }, { $set: { isActive: !existing.isActive, updatedAt: new Date() } } as any);
      if (!write.matchedCount) return res.status(404).json({ message: 'Member not found' });
      const member = await col.findOne({ _id: existing._id } as any);
      if (!member) return res.status(404).json({ message: 'Member not found' });
      res.json(member);
    } catch (error) {
      console.error('Error toggling member status:', error);
      res.status(500).json({ message: 'Failed to toggle member status' });
    }
  });

  app.delete('/api/members/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Member not found' });
      }
      const col = await getCollection<any>('members');
      const existing = await col.findOne({ _id: new ObjectId(id) } as any);
      const result = await col.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount !== 1) {
        return res.status(404).json({ message: 'Member not found' });
      }
      try {
        const activities = await getCollection<{ ts: Date; type: string; by?: string; memberName?: string; memberId?: string }>('activities');
        const by = ((req as any)?.user?.email as string) || undefined;
        await activities.insertOne({ ts: new Date(), type: 'member_deleted', by, memberName: existing?.fullName, memberId: existing?.memberId } as any);
      } catch {}
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
      // Record activity: settings updated
      try {
        const activities = await getCollection<{ ts: Date; type: string; by?: string }>('activities');
        const by = ((req as any)?.user?.email as string) || undefined;
        await activities.insertOne({ ts: new Date(), type: 'settings_update', by } as any);
      } catch {}
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
      const inactiveMembers = members.length - activeMembers.length;
      let downloadsToday = 0;
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const downloads = await getCollection<{ ts: Date }>('downloads');
        downloadsToday = await downloads.countDocuments({ ts: { $gte: start } } as any);
      } catch {}
      const stats = {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        inactiveMembers,
        downloadsToday,
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Activities feed (e.g., settings updates)
  app.get('/api/activities', async (req, res) => {
    try {
      const qp = req.query as Record<string, unknown>;
      const limitParam = Array.isArray(qp.limit) ? (qp.limit[0] as string) : (qp.limit as string | undefined);
      const limit = Math.max(1, Math.min(25, parseInt(limitParam || '5', 10) || 5));
      const activities = await getCollection<{ ts: Date; type: string; by?: string }>('activities');
      const docs = await activities.find({} as any).sort({ ts: -1 }).limit(limit).toArray();
      res.json(docs);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });

  // Client-side activity hooks (e.g., whatsapp share)
  app.post('/api/activities', async (req, res) => {
    try {
      const body = req.body as any;
      const activities = await getCollection<{ ts: Date; type: string; by?: string; memberId?: string; memberName?: string }>('activities');
      const by = ((req as any)?.user?.email as string) || undefined;
      await activities.insertOne({ ts: new Date(), type: body?.type || 'custom', by, memberId: body?.memberId, memberName: body?.memberName } as any);
      res.json({ ok: true });
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(500).json({ message: 'Failed to create activity' });
    }
  });

  // Utility: seed whitelist emails (one-time)
  app.post('/api/debug/seed-whitelist', async (_req, res) => {
    try {
      const col = await getCollection<{ email: string }>('whitlist_ids');
      await col.updateOne({ email: 'ranveerminhas34@gmail.com' }, { $set: { email: 'ranveerminhas34@gmail.com' } }, { upsert: true });
      await col.updateOne({ email: 'gouravminhas2k@gmail.com' }, { $set: { email: 'gouravminhas2k@gmail.com' } }, { upsert: true });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: 'Failed to seed whitelist' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
