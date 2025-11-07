const { sanitizeInput, sanitizeHtml, escapeHtml } = require('../../../src/utils/sanitize');

describe('sanitizeInput', () => {
  it('should remove XSS payloads from strings', () => {
    const input = '<script>alert("XSS")</script>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('should sanitize nested objects', () => {
    const input = { name: '<img src=x onerror=alert(1)>', email: 'test@test.com' };
    const result = sanitizeInput(input);
    expect(result.name).not.toContain('<img');
    expect(result.email).toBe('test@test.com');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeInput(null)).toBeNull();
    expect(sanitizeInput(undefined)).toBeUndefined();
  });

  it('should trim whitespace', () => {
    const result = sanitizeInput('  test  ');
    expect(result).toBe('test');
  });
});

describe('sanitizeHtml', () => {
  it('should remove all HTML tags', () => {
    const input = '<div>Hello <b>World</b></div>';
    const result = sanitizeHtml(input);
    expect(result).toBe('Hello World');
  });

  it('should handle script tags', () => {
    const input = '<script>alert("XSS")</script>Safe';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
  });
});

describe('escapeHtml', () => {
  it('should escape HTML entities', () => {
    const input = '<div>"test" & \'quote\'</div>';
    const result = escapeHtml(input);
    expect(result).toBe('&lt;div&gt;&quot;test&quot; &amp; &#039;quote&#039;&lt;/div&gt;');
  });
});
