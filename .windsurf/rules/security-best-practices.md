---
trigger: model_decision
description: Review this rule whenever a substantial amount of code has been edited or created
---

# Security Best Practices for Windsurf Demo

0. Ensure rate limiting is implemented.

## General Security Guidelines

1. **Keep Dependencies Updated**
   - Regularly update Flask, NumPy, and JavaScript dependencies
   - Use tools like `npm audit` and `pip-audit` to check for vulnerabilities
   - Pin dependencies to specific versions in requirements.txt and package.json

2. **Input Validation**
   - Validate all user inputs on both client and server sides
   - Use parameterized queries for any database operations
   - Sanitize inputs to prevent XSS, SQL injection, and command injection

3. **Authentication & Authorization**
   - Implement proper authentication for multiplayer features
   - Use secure session management with Flask-Session
   - Apply principle of least privilege for all operations

4. **Secure Communications**
   - Use HTTPS for all communications in production
   - Implement proper CORS policies
   - Set secure and HttpOnly flags on cookies

## Python-Specific Rules

1. **Flask Configuration**
   - Never use `debug=True` in production
   - Set appropriate Content Security Policy headers
   - Disable Flask's development server in production; use gunicorn or uwsgi

2. **Data Handling**
   - Validate and sanitize all JSON data received via API endpoints
   - Use Flask's built-in protection against CSRF attacks
   - Implement rate limiting on API endpoints

3. **Error Handling**
   - Implement proper exception handling
   - Never expose stack traces to users
   - Log errors securely without exposing sensitive information

## JavaScript-Specific Rules

1. **Client-Side Security**
   - Use Content Security Policy to prevent XSS attacks
   - Sanitize any dynamic HTML content
   - Avoid using `eval()` or `innerHTML`

2. **Game State Management**
   - Never trust client-side data for game logic
   - Implement server-side validation for all game state changes
   - Use secure random number generation for game mechanics

3. **Third-Party Libraries**
   - Audit all third-party libraries before inclusion
   - Minimize use of external CDNs
   - Use Subresource Integrity (SRI) when loading external resources

## Development Practices

1. **Code Reviews**
   - Require security-focused code reviews
   - Use automated static analysis tools
   - Follow the "four eyes principle" for security-critical code

2. **Testing**
   - Implement security-focused unit and integration tests
   - Perform regular security testing
   - Consider using tools like OWASP ZAP for vulnerability scanning

3. **Deployment**
   - Use a proper CI/CD pipeline with security checks
   - Implement infrastructure as code with security best practices
   - Regularly backup and test restoration procedures

## Specific Rules for this Application

1. **Game State Protection**
   - Implement server-side validation for all player movements and actions
   - Use secure random number generation for food placement
   - Protect against cheating by validating game physics server-side

2. **API Endpoints**
   - Implement rate limiting on `/update_player` and `/game_state` endpoints
   - Validate all incoming JSON data structure and values
   - Implement proper error handling for malformed requests

3. **User Data**
   - Minimize collection of user data
   - Follow data protection regulations (GDPR, CCPA, etc.)
   - Implement proper data retention policies