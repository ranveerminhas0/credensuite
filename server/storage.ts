import { type Member, type InsertMember, type NgoSettings, type InsertNgoSettings, type CardTemplate, type InsertCardTemplate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Member operations
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;
  searchMembers(query: string): Promise<Member[]>;
  
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
    for (const tmpl of this.templates.values()) {
      tmpl.isActive = false;
    }

    // Activate the selected template
    template.isActive = true;
    template.updatedAt = new Date();
    return true;
  }
}

export const storage = new MemStorage();
