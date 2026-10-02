<?php

return [

    'groq' => [
        'api_key' => env('GROQ_API_KEY'),
        'model' => env('GROQ_MODEL', 'llama-3.1-70b-versatile'),
        'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
    ],

    // Per-context model configuration.
    // Use a heavier model for SQL generation and a lighter model for FAQ answering.
    'models' => [
        'tenant_sql' => env('GROQ_MODEL_TENANT_SQL', env('GROQ_MODEL', 'qwen/qwen3.6-27b')),
        'tenant_knowledge' => env('GROQ_MODEL_TENANT_KNOWLEDGE', env('GROQ_MODEL', 'qwen/qwen3.6-27b')),
        'super_admin_sql' => env('GROQ_MODEL_SA_SQL', env('GROQ_MODEL', 'qwen/qwen3.6-27b')),
        'super_admin_knowledge' => env('GROQ_MODEL_SA_KNOWLEDGE', env('GROQ_MODEL', 'qwen/qwen3.6-27b')),
        'public' => env('GROQ_MODEL_PUBLIC', env('GROQ_MODEL', 'qwen/qwen3.6-27b')),
    ],

    'limits' => [
        'max_sql_rows' => 100,
        'sql_timeout_seconds' => 10,
        'messages_per_minute' => 30,
        'public_messages_per_minute' => 20,
    ],

    'tenant' => [
        // Tables the tenant chatbot is allowed to query. Must all have a tenant_id column.
        'allowed_tables' => [
            'brands',
            'sizes',
            'tiles',
            'products',
            'suppliers',
            'stocks',
            'stock_logs',
            'customers',
            'quotations',
            'quotation_items',
            'accounts_payables',
            'accounts_receivables',
            'tile_returns',
            'users',
        ],

        // Static how-to knowledge for the tenant chatbot ("how do I use the app").
        'knowledge' => [
            [
                'title' => 'How do I create a quotation?',
                'content' => 'Go to Orders → New Order, select a customer, add tile or product items, set discounts/tax if needed, and click Save. You can then download the quotation as a PDF.',
            ],
            [
                'title' => 'How do I add stock?',
                'content' => 'Go to Stock → New Stock, choose the supplier, select tiles or products, enter quantities and prices, and save. Stock will be updated automatically.',
            ],
            [
                'title' => 'How do I track accounts receivable?',
                'content' => 'When you create a quotation with remaining amount, an accounts receivable record is created automatically. Go to Accounts Receivables to view and manage payments.',
            ],
            [
                'title' => 'How do I add a new customer?',
                'content' => 'Go to Customers → New Customer, fill in the name, phone, address, and CNIC if needed, then save. Customers can be selected when creating quotations.',
            ],
            [
                'title' => 'How do I manage tiles and products?',
                'content' => 'Use the Brands, Sizes, Tiles, and Products menus. Create brands first, then sizes, then tiles with their brand and size, and finally products if needed.',
            ],
            [
                'title' => 'How do I view reports?',
                'content' => 'Go to Reports to see profit/loss, payables aging, receivables aging, sales by product/brand/customer, and stock valuation.',
            ],
            [
                'title' => 'How do I handle returns?',
                'content' => 'Use the Returns/Exchange menu if the feature is enabled. Select the customer, choose the tiles to return, and the system will calculate the return amount.',
            ],
            [
                'title' => 'How do I manage users and roles?',
                'content' => 'Go to Users to add or manage users. Go to Roles to create roles and assign permissions. Assign roles to users to control what they can access.',
            ],
            [
                'title' => 'How do I manage suppliers?',
                'content' => 'Go to Suppliers to add and manage your suppliers. Suppliers are selected when recording stock purchases.',
            ],
            [
                'title' => 'How do I handle accounts payable?',
                'content' => 'When you record stock purchases, accounts payable records are created automatically. Go to Accounts Payables to view outstanding amounts owed to suppliers.',
            ],
        ],
    ],

    'super_admin' => [
        'allowed_tables' => [
            'tenants',
            'users',
            'brands',
            'sizes',
            'tiles',
            'products',
            'suppliers',
            'stocks',
            'stock_logs',
            'customers',
            'quotations',
            'quotation_items',
            'accounts_payables',
            'accounts_receivables',
            'tile_returns',
            'activity_log',
            'system_settings',
        ],

        'knowledge' => [
            [
                'title' => 'How do I manage tenants?',
                'content' => 'Use the Tenants menu in the super-admin panel. You can create, edit, activate, deactivate, impersonate, and export tenant data.',
            ],
            [
                'title' => 'How do roles and permissions work?',
                'content' => 'Roles are scoped per tenant. Use the Roles and Permissions menus to manage what tenant users can do. Super admins have full access.',
            ],
            [
                'title' => 'How do I view system activity?',
                'content' => 'Go to Activity Logs to see a full audit trail of actions across all tenants.',
            ],
            [
                'title' => 'How do I export tenant data?',
                'content' => 'On the tenant list or tenant detail page, use the Export action to download a tenant\'s data.',
            ],
            [
                'title' => 'How do I manage super admin users?',
                'content' => 'Go to Super Admins in the menu to add, edit, or remove super admin accounts. Only super admins can manage other super admin users.',
            ],
            [
                'title' => 'How do I use Omni Search?',
                'content' => 'Press Ctrl+K or click the search icon to open Omni Search. You can search across tenants, users, and platform records from a single interface.',
            ],
        ],
    ],

    // Public website chatbot — answers questions about the platform only.
    // No database access. Knowledge is static and based on public page content.
    'public' => [
        'knowledge' => [
            [
                'title' => 'What is this platform?',
                'content' => 'TilePOS is a comprehensive business management platform designed specifically for the tiles and construction industry. It helps businesses manage quotations, inventory, customers, suppliers, accounts, and generate detailed reports — all from a single, easy-to-use system.',
            ],
            [
                'title' => 'What features does the platform offer?',
                'content' => 'TilePOS offers: Quotation & Order Management (create, send, and track customer orders and quotations with PDF export), Inventory & Stock Management (track tiles and products with real-time stock levels and stock logs), Customer Management (maintain a complete customer database with payment history), Supplier Management (manage supplier accounts and purchase records), Accounts Payable & Receivable (track what you owe suppliers and what customers owe you), Financial Reports (profit/loss statements, sales by product/brand/customer, stock valuation), Returns & Exchanges (process tile returns and calculate return amounts), Role-Based Access Control (manage user permissions with custom roles), and Multi-tenant Support (each business gets its own isolated environment).',
            ],
            [
                'title' => 'How does the platform work?',
                'content' => 'TilePOS works as a cloud-based, multi-tenant SaaS platform. After registering, you get your own private workspace. You can add your products, tiles, customers, and suppliers. When a customer places an order, you create a quotation, which automatically tracks receivables. When you purchase stock, it tracks payables. Reports are generated automatically from your data.',
            ],
            [
                'title' => 'What pricing plans are available?',
                'content' => 'TilePOS offers flexible pricing plans suited for businesses of all sizes. Please visit the Pricing page at /pricing for current plan details and pricing. Plans typically include different limits on users, storage, and features. Contact us for enterprise pricing.',
            ],
            [
                'title' => 'Does the platform support inventory management?',
                'content' => 'Yes. TilePOS has a full inventory management system. You can manage tiles by brand and size, track stock quantities, record stock purchases from suppliers, view stock valuation reports, and get alerts for low stock items.',
            ],
            [
                'title' => 'Does the platform support multi-tenant businesses?',
                'content' => 'Yes. TilePOS is built as a multi-tenant platform. Each business (tenant) has its own completely isolated workspace. Data from one business is never visible to another. Super admins manage the platform and can oversee all tenants.',
            ],
            [
                'title' => 'How can I contact the company?',
                'content' => 'You can reach us through the Contact Us page at /contact-us. Fill in your name, email, subject, and message and we will get back to you within 24 hours.',
            ],
            [
                'title' => 'What is your privacy policy?',
                'content' => 'Our privacy policy explains how we collect, use, and protect your data. Key points: we only collect data necessary to provide the service, your business data is isolated from other tenants, we do not sell your data to third parties, and you can request data export or deletion at any time. See the full policy at /privacy-policy.',
            ],
            [
                'title' => 'What are the terms and conditions?',
                'content' => 'Our terms and conditions govern your use of the TilePOS platform. Key points include acceptable use, payment terms, data ownership, service availability, and termination. See the full terms at /terms.',
            ],
            [
                'title' => 'What is your cookie policy?',
                'content' => 'We use cookies to maintain your login session and improve platform performance. We do not use third-party advertising cookies. See the full cookie policy at /cookie-policy.',
            ],
            [
                'title' => 'How do I get started or register?',
                'content' => 'Click the "Get Started" or "Register" button on the homepage or visit /tenant/register to create your business account. Registration is quick — just provide your business name and email to get started.',
            ],
            [
                'title' => 'Does the platform support PDF export?',
                'content' => 'Yes. You can download quotations and tile return documents as professionally formatted PDFs directly from the platform.',
            ],
            [
                'title' => 'What reports does the platform generate?',
                'content' => 'TilePOS generates: Profit & Loss Reports, Sales by Product, Sales by Brand, Sales by Customer, Accounts Payables Aging, Accounts Receivables Aging, and Stock Valuation reports.',
            ],
            [
                'title' => 'Is my data secure?',
                'content' => 'Yes. TilePOS uses strict tenant isolation — your data is completely separated from other businesses on the platform. All data is stored securely, access is controlled through role-based permissions, and all actions are logged in an audit trail.',
            ],
        ],
    ],
];
