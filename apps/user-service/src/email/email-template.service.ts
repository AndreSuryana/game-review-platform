import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { join } from 'path';
import { convert } from 'html-to-text';

@Injectable()
export class EmailTemplateService {
  private readonly templateDir = join(__dirname, '/templates');

  /**
   * Load and render a Handlebars template with dynamic data.
   * @param templateName - The name of the template file (without extension).
   * @param placeholders - Key-value pairs to replace in the template.
   * @returns Rendered HTML content.
   */
  renderTemplate(name: string, placeholders: Record<string, any>): string {
    const templatePath = join(this.templateDir, `${name}.template.hbs`);
    const templateHtml = readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateHtml);
    return template(placeholders);
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
