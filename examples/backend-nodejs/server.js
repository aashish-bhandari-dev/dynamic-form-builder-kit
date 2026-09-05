// examples/backend-nodejs/server.js
// Production-ready, zero-dependency Node.js REST API server for dynamic-form-builder-kit

const http = require('http');
const { randomUUID } = require('crypto');

const PORT = Number(process.env.PORT) || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// In-memory data store for forms and submissions
const forms = new Map();
const submissions = new Map();

// Seed initial sample form for instant out-of-the-box testing
const initialFormId = 'customer-feedback-demo';
forms.set(initialFormId, {
    id: initialFormId,
    title: 'Customer Feedback Survey',
    content: {
        fields: [
            {
                id: 'field_name',
                type: 'text',
                name: 'full_name',
                label: 'Full Name',
                placeholder: 'e.g. Jane Doe',
                required: true,
                columnWidth: 'half',
                rowId: 'row_1',
            },
            {
                id: 'field_email',
                type: 'email',
                name: 'email',
                label: 'Email Address',
                placeholder: 'jane@example.com',
                required: true,
                columnWidth: 'half',
                rowId: 'row_1',
            },
            {
                id: 'field_rating',
                type: 'slider',
                name: 'satisfaction_score',
                label: 'Satisfaction Score (1-10)',
                required: true,
                columnWidth: 'full',
                rowId: 'row_2',
                minValue: 1,
                maxValue: 10,
                step: 1,
            },
            {
                id: 'field_recommend',
                type: 'radio',
                name: 'would_recommend',
                label: 'Would you recommend our service to a friend?',
                required: true,
                columnWidth: 'full',
                rowId: 'row_3',
                orientation: 'horizontal',
                options: ['Definitely', 'Maybe', 'Not at this time'],
            },
            {
                id: 'field_comments',
                type: 'textarea',
                name: 'comments',
                label: 'Additional Comments or Feedback',
                placeholder: 'Tell us how we can improve...',
                required: false,
                columnWidth: 'full',
                rowId: 'row_4',
                rows: 3,
            },
        ],
        rows: [
            { id: 'row_1', fields: ['field_name', 'field_email'] },
            { id: 'row_2', fields: ['field_rating'] },
            { id: 'row_3', fields: ['field_recommend'] },
            { id: 'row_4', fields: ['field_comments'] },
        ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

function applyCors(req, res) {
    const origin = req.headers.origin;
    // Allow any localhost origin during local development, or configured CLIENT_ORIGIN
    if (origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === CLIENT_ORIGIN)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', CLIENT_ORIGIN);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 5 * 1024 * 1024) {
                // 5MB limit
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(new Error('Invalid JSON payload'));
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    res.setHeader('Content-Type', 'application/json');

    try {
        // Health check endpoint
        if (req.method === 'GET' && (pathname === '/health' || pathname === '/api/health')) {
            res.writeHead(200);
            return res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
        }

        // GET /api/forms -> List all forms
        if (req.method === 'GET' && pathname === '/api/forms') {
            const allForms = Array.from(forms.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
            res.writeHead(200);
            return res.end(JSON.stringify(allForms));
        }

        // POST /api/forms -> Create new form schema
        if (req.method === 'POST' && pathname === '/api/forms') {
            const body = await parseJsonBody(req);
            if (!body.title) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Title is required' }));
            }
            const id = randomUUID();
            const newForm = {
                id,
                title: body.title,
                content: body.content || { fields: [], rows: [] },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            forms.set(id, newForm);
            res.writeHead(201);
            return res.end(JSON.stringify(newForm));
        }

        // Routes with form ID: /api/forms/:id
        const formIdMatch = pathname.match(/^\/api\/forms\/([a-zA-Z0-9_-]+)$/);
        if (formIdMatch) {
            const formId = formIdMatch[1];

            // GET /api/forms/:id
            if (req.method === 'GET') {
                const form = forms.get(formId);
                if (!form) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Form not found' }));
                }
                res.writeHead(200);
                return res.end(JSON.stringify(form));
            }

            // PUT /api/forms/:id
            if (req.method === 'PUT') {
                const form = forms.get(formId);
                if (!form) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Form not found' }));
                }
                const body = await parseJsonBody(req);
                form.title = body.title !== undefined ? body.title : form.title;
                form.content = body.content !== undefined ? body.content : form.content;
                form.updatedAt = new Date().toISOString();
                res.writeHead(200);
                return res.end(JSON.stringify(form));
            }

            // DELETE /api/forms/:id
            if (req.method === 'DELETE') {
                forms.delete(formId);
                submissions.delete(formId);
                res.writeHead(200);
                return res.end(JSON.stringify({ success: true }));
            }
        }

        // Submission routes: /api/forms/:id/submissions
        const submissionsMatch = pathname.match(/^\/api\/forms\/([a-zA-Z0-9_-]+)\/submissions$/);
        if (submissionsMatch) {
            const formId = submissionsMatch[1];
            const form = forms.get(formId);

            if (!form) {
                res.writeHead(404);
                return res.end(JSON.stringify({ error: 'Form not found' }));
            }

            // POST /api/forms/:id/submissions -> Submit form response
            if (req.method === 'POST') {
                const submissionData = await parseJsonBody(req);

                // Validate required fields
                const missingFields = [];
                for (const field of form.content.fields || []) {
                    if (field.required && !['header', 'paragraph'].includes(field.type)) {
                        const key = field.name || field.id;
                        const val = submissionData[key];
                        if (val === undefined || val === null || val === '') {
                            missingFields.push(field.label || key);
                        }
                    }
                }

                if (missingFields.length > 0) {
                    res.writeHead(400);
                    return res.end(
                        JSON.stringify({
                            error: 'Missing required fields',
                            missingFields,
                        }),
                    );
                }

                const subId = randomUUID();
                const record = {
                    id: subId,
                    formId,
                    data: submissionData,
                    createdAt: new Date().toISOString(),
                };

                const currentList = submissions.get(formId) || [];
                currentList.unshift(record);
                submissions.set(formId, currentList);

                res.writeHead(201);
                return res.end(JSON.stringify({ success: true, id: subId }));
            }

            // GET /api/forms/:id/submissions -> Get submissions
            if (req.method === 'GET') {
                const list = submissions.get(formId) || [];
                res.writeHead(200);
                return res.end(JSON.stringify(list));
            }
        }

        // Fallthrough 404
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
    }
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Form Builder API Backend Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🌐 CORS Allowed Origin: ${CLIENT_ORIGIN}`);
    console.log(`📋 Pre-loaded Sample Form: http://localhost:${PORT}/api/forms/${initialFormId}`);
    console.log(`======================================================\n`);
});
