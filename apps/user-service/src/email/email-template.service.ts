import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdirSync, readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { join } from 'path';
import { convert } from 'html-to-text';

@Injectable()
export class EmailTemplateService {
  private readonly templateDir = join(__dirname, '/templates');
  private readonly logger = new Logger(EmailTemplateService.name, {
    timestamp: true,
  });

  constructor() {
    this.registerTemplates();
  }
  
  /**
   * Preload and register Handlebars templates during module initialization.
  */
 private registerTemplates() {
    const files = readdirSync(this.templateDir);
    this.logger.log(`Loading templates from: ${this.templateDir}`);

    files.forEach((file) => {
      if (file.endsWith('.template.hbs')) {
        const templateName = file.replace('.template.hbs', '');
        const templatePath = join(this.templateDir, file);
        const templateContent = readFileSync(templatePath, 'utf-8');
        Handlebars.registerPartial(templateName, templateContent);
        this.logger.log(`Registered template: ${templateName}`);
      }
    });
  }

  /**
   * Render a registered Handlebars template with dynamic data.
   * @param templateName - The name of the template.
   * @param placeholders - Key-value pairs to replace in the template.
   * @returns Rendered HTML content.
   */
  renderTemplate(name: string, placeholders: Record<string, any>): string {
    const template = Handlebars.partials[name] as string;
    if (!template) {
      throw new Error(`Template "${name}" not found`);
    }
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(placeholders);
  }

  /**
   * Convert HTML to plain text.
   * @param html - The HTML content to convert.
   * @returns Plain text representation of the HTML.
   */
  convertHtmlToPlainText(html: string): string {
    return convert(html, {
      wordwrap: 100,
      selectors: [
        { selector: 'a', options: { baseUrl: '' } }, // Handles anchor tags
      ],
    });
  }
}
