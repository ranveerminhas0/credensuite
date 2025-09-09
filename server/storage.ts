import { type Member, type InsertMember, type NgoSettings, type InsertNgoSettings, type CardTemplate, type InsertCardTemplate } from "@shared/schema";
import { randomUUID } from "crypto";
import { getCollection } from "./db";
import { ObjectId } from "mongodb";

class MongoStorage implements IStorage {
  private async membersCol() { return await getCollection<Member>("members"); }
  private async settingsCol() { return await getCollection<NgoSettings>("ngo_settings"); }
  private async templatesCol() { return await getCollection<CardTemplate>("card_templates"); }
  private async countersCol() { return await getCollection<{ _id: string; seq: number }>("counters"); }

  private async nextMemberSeqForYear(year: number): Promise<number> {
    const col = await this.countersCol();
    const key = `member_seq_${year}`;
    await col.updateOne({ _id: key }, { $inc: { seq: 1 } }, { upsert: true });
    const doc = await col.findOne({ _id: key });
    const seq = doc?.seq ?? 1;
    console.log(`[MongoStorage] Counter ${key} -> seq=${seq}`);
    return seq;
  }

  private async generateMemberId(): Promise<string> {
    const year = new Date().getFullYear();
    const seq = await this.nextMemberSeqForYear(year);
    return `NGO-${year}-${String(seq).padStart(3, '0')}`;
  }

  private buildMemberIdFilter(id: string) {
    const maybeObjectId = /^[a-fA-F0-9]{24}$/i.test(id) ? new ObjectId(id) : null;
    return maybeObjectId ? { $or: [{ id }, { _id: maybeObjectId }] } : { id };
  }

  async getMembers(): Promise<Member[]> {
    const col = await this.membersCol();
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    return docs;
  }

  async getMember(id: string): Promise<Member | undefined> {
    const col = await this.membersCol();
    const filter = this.buildMemberIdFilter(id);
    const doc = await col.findOne(filter as any);
    return doc ?? undefined;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const col = await this.membersCol();
    const id = randomUUID();
    const memberId = await this.generateMemberId();
    console.log(`[MongoStorage] Creating member id=${id} memberId=${memberId}`);
    const now = new Date();
    const member: Member = {
      ...insertMember,
      id,
      memberId,
      bloodGroup: insertMember.bloodGroup || null,
      emergencyContactName: insertMember.emergencyContactName || null,
      emergencyContactNumber: insertMember.emergencyContactNumber || null,
      photoUrl: insertMember.photoUrl || null,
      isActive: insertMember.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await col.insertOne(member as any);
    return member;
  }

  async updateMember(id: string, updateData: Partial<InsertMember>): Promise<Member | undefined> {
    const col = await this.membersCol();
    const now = new Date();
    const filter = this.buildMemberIdFilter(id);
    const res: any = await col.findOneAndUpdate(
      filter as any,
      { $set: { ...updateData, updatedAt: now } },
      { returnDocument: "after" }
    );
    return res?.value ?? undefined;
  }

  async deleteMember(id: string): Promise<boolean> {
    const col = await this.membersCol();
    const filter = this.buildMemberIdFilter(id);
    const res = await col.deleteOne(filter as any);
    return res.deletedCount === 1;
  }

  async searchMembers(query: string): Promise<Member[]> {
    const col = await this.membersCol();
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
    const docs = await col.find({
      $or: [
        { fullName: regex },
        { memberId: regex },
        { designation: regex },
        { contactNumber: regex },
      ],
    }).toArray();
    return docs;
  }

  async searchMembersByPhone(phone: string): Promise<Member[]> {
    const col = await this.membersCol();
    const regex = new RegExp(phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
    const docs = await col.find({
      contactNumber: regex,
    }).toArray();
    return docs;
  }

  async searchMembersByJoiningDate(date: string): Promise<Member[]> {
    const col = await this.membersCol();
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const docs = await col.find({
      joiningDate: {
        $gte: startDate,
        $lt: endDate,
      },
    }).toArray();
    return docs;
  }

  async searchMembersByEmergencyName(name: string): Promise<Member[]> {
    const col = await this.membersCol();
    const regex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
    const docs = await col.find({
      emergencyContactName: regex,
    }).toArray();
    return docs;
  }

  async searchMembersByEmergencyPhone(phone: string): Promise<Member[]> {
    const col = await this.membersCol();
    const regex = new RegExp(phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
    const docs = await col.find({
      emergencyContactNumber: regex,
    }).toArray();
    return docs;
  }

  async getNgoSettings(): Promise<NgoSettings | undefined> {
    const col = await this.settingsCol();
    const doc = await col.findOne({});
    return doc ?? undefined;
  }

  async updateNgoSettings(settings: InsertNgoSettings): Promise<NgoSettings> {
    const col = await this.settingsCol();
    const existing = await col.findOne({});
    const now = new Date();
    const merged: NgoSettings = {
      id: existing?.id || randomUUID(),
      organizationName: settings.organizationName ?? existing?.organizationName ?? "",
      phoneNumber: settings.phoneNumber ?? existing?.phoneNumber ?? null,
      emailAddress: settings.emailAddress ?? existing?.emailAddress ?? null,
      address: settings.address ?? existing?.address ?? null,
      website: settings.website ?? existing?.website ?? null,
      logoUrl: settings.logoUrl ?? existing?.logoUrl ?? null,
      signatureUrl: settings.signatureUrl ?? existing?.signatureUrl ?? null,
      qrCodePattern: settings.qrCodePattern ?? existing?.qrCodePattern ?? "https://verify.example.org/{id}",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    await col.updateOne({ id: merged.id }, { $set: merged }, { upsert: true });
    return merged;
  }

  async getTemplates(): Promise<CardTemplate[]> {
    const col = await this.templatesCol();
    return await col.find({}).toArray();
  }

  async getTemplate(id: string): Promise<CardTemplate | undefined> {
    const col = await this.templatesCol();
    const doc = await col.findOne({ id });
    return doc ?? undefined;
  }

  async createTemplate(insertTemplate: InsertCardTemplate): Promise<CardTemplate> {
    const col = await this.templatesCol();
    const now = new Date();
    const doc: CardTemplate = {
      ...insertTemplate,
      id: randomUUID(),
      isActive: insertTemplate.isActive ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await col.insertOne(doc as any);
    return doc;
  }

  async updateTemplate(id: string, updateData: Partial<InsertCardTemplate>): Promise<CardTemplate | undefined> {
    const col = await this.templatesCol();
    const res: any = await col.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return res?.value ?? undefined;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const col = await this.templatesCol();
    const res = await col.deleteOne({ id });
    return res.deletedCount === 1;
  }

  async setActiveTemplate(id: string): Promise<boolean> {
    const col = await this.templatesCol();
    const doc = await col.findOne({ id });
    if (!doc) return false;
    await col.updateMany({}, { $set: { isActive: false } });
    await col.updateOne({ id }, { $set: { isActive: true, updatedAt: new Date() } });
    return true;
  }
}

export interface IStorage {
  // Member operations
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;
  searchMembers(query: string): Promise<Member[]>;
  searchMembersByPhone(phone: string): Promise<Member[]>;
  searchMembersByJoiningDate(date: string): Promise<Member[]>;
  searchMembersByEmergencyName(name: string): Promise<Member[]>;
  searchMembersByEmergencyPhone(phone: string): Promise<Member[]>;
  
  // NGO Settings operations
  getNgoSettings(): Promise<NgoSettings | undefined>;
  updateNgoSettings(settings: InsertNgoSettings): Promise<NgoSettings>;
  
  // Template operations
  getTemplates(): Promise<CardTemplate[]>;
  getTemplate(id: string): Promise<CardTemplate | undefined>;
  createTemplate(template: InsertCardTemplate): Promise<CardTemplate>;
  updateTemplate(id: string, template: Partial<InsertCardTemplate>): Promise<CardTemplate | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
  setActiveTemplate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private members: Map<string, Member>;
  private ngoSettings: NgoSettings | undefined;
  private templates: Map<string, CardTemplate>;
  private memberIdCounter: number = 1;

  constructor() {
    this.members = new Map();
    this.templates = new Map();
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Initialize default NGO settings
    this.ngoSettings = {
      id: randomUUID(),
      organizationName: "Hope Foundation NGO",
      phoneNumber: "(555) 123-4567",
      emailAddress: "info@hopefoundation.org",
      address: "123 Main Street, City, State 12345",
      website: "https://hopefoundation.org",
      logoUrl: null,
      signatureUrl: null,
      qrCodePattern: "https://verify.hopefoundation.org/{id}",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Initialize default template
    const defaultTemplate: CardTemplate = {
      id: randomUUID(),
      name: "Blue Professional",
      colorScheme: "blue",
      fontStyle: "Inter",
      layoutStyle: "horizontal",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.templates.set(defaultTemplate.id, defaultTemplate);
  }

  private generateMemberId(): string {
    const year = new Date().getFullYear();
    const id = `NGO-${year}-${String(this.memberIdCounter).padStart(3, '0')}`;
    this.memberIdCounter++;
    return id;
  }

  async getMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = randomUUID();
    const memberId = this.generateMemberId();
    const member: Member = {
      ...insertMember,
      id,
      memberId,
      bloodGroup: insertMember.bloodGroup || null,
      emergencyContactName: insertMember.emergencyContactName || null,
      emergencyContactNumber: insertMember.emergencyContactNumber || null,
      photoUrl: insertMember.photoUrl || null,
      isActive: insertMember.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.members.set(id, member);
    return member;
  }

  async updateMember(id: string, updateData: Partial<InsertMember>): Promise<Member | undefined> {
    const member = this.members.get(id);
    if (!member) return undefined;

    const updatedMember: Member = {
      ...member,
      ...updateData,
      updatedAt: new Date(),
    };
    this.members.set(id, updatedMember);
    return updatedMember;
  }

  async deleteMember(id: string): Promise<boolean> {
    return this.members.delete(id);
  }

  async searchMembers(query: string): Promise<Member[]> {
    const members = Array.from(this.members.values());
    const lowercaseQuery = query.toLowerCase();
    
    return members.filter(member => 
      member.fullName.toLowerCase().includes(lowercaseQuery) ||
      member.memberId.toLowerCase().includes(lowercaseQuery) ||
      member.designation.toLowerCase().includes(lowercaseQuery) ||
      member.contactNumber.includes(query)
    );
  }

  async searchMembersByPhone(phone: string): Promise<Member[]> {
    const members = Array.from(this.members.values());
    return members.filter(member => 
      member.contactNumber.includes(phone)
    );
  }

  async searchMembersByJoiningDate(date: string): Promise<Member[]> {
    const members = Array.from(this.members.values());
    const targetDate = new Date(date);
    const targetDateStr = targetDate.toDateString();
    
    return members.filter(member => 
      new Date(member.joiningDate).toDateString() === targetDateStr
    );
  }

  async searchMembersByEmergencyName(name: string): Promise<Member[]> {
    const members = Array.from(this.members.values());
    const lowercaseName = name.toLowerCase();
    
    return members.filter(member => 
      member.emergencyContactName?.toLowerCase().includes(lowercaseName)
    );
  }

  async searchMembersByEmergencyPhone(phone: string): Promise<Member[]> {
    const members = Array.from(this.members.values());
    
    return members.filter(member => 
      member.emergencyContactNumber?.includes(phone)
    );
  }

  async getNgoSettings(): Promise<NgoSettings | undefined> {
    return this.ngoSettings;
  }

  async updateNgoSettings(settings: InsertNgoSettings): Promise<NgoSettings> {
    this.ngoSettings = {
      ...this.ngoSettings!,
      ...settings,
      updatedAt: new Date(),
    };
    return this.ngoSettings;
  }

  async getTemplates(): Promise<CardTemplate[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: string): Promise<CardTemplate | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertCardTemplate): Promise<CardTemplate> {
    const id = randomUUID();
    const template: CardTemplate = {
      ...insertTemplate,
      id,
      isActive: insertTemplate.isActive ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, updateData: Partial<InsertCardTemplate>): Promise<CardTemplate | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updatedTemplate: CardTemplate = {
      ...template,
      ...updateData,
      updatedAt: new Date(),
    };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  async setActiveTemplate(id: string): Promise<boolean> {
    const template = this.templates.get(id);
    if (!template) return false;

    // Deactivate all templates
    Array.from(this.templates.values()).forEach((tmpl) => { tmpl.isActive = false; });

    // Activate the selected template
    template.isActive = true;
    template.updatedAt = new Date();
    return true;
  }
}

export const storage = new MongoStorage();
