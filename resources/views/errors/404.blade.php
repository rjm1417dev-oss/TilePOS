<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Page Not Found</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #f8fafc;
            --card: rgba(255, 255, 255, 0.92);
            --border: #e2e8f0;
            --text: #0f172a;
            --muted: #64748b;
            --primary: #0d9488;
            --primary-hover: #0f766e;
            --shadow: 0 10px 40px -10px rgba(34, 37, 46, 0.12);
            --glow: rgba(13, 148, 136, 0.15);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #0f172a;
                --card: rgba(30, 41, 59, 0.8);
                --border: #334155;
                --text: #f8fafc;
                --muted: #94a3b8;
                --primary: #14b8a6;
                --primary-hover: #2dd4bf;
                --shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3);
                --glow: rgba(20, 184, 166, 0.2);
            }
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg);
            color: var(--text);
        }

        .wrapper { position: relative; padding: 2rem; }

        .glow {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 260px;
            height: 260px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: var(--glow);
            filter: blur(80px);
            pointer-events: none;
        }

        .card {
            position: relative;
            text-align: center;
            padding: 3rem;
            max-width: 460px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 1.25rem;
            box-shadow: var(--shadow);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }

        .code {
            font-size: 7rem;
            font-weight: 700;
            line-height: 1;
            letter-spacing: -0.05em;
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        h1 { font-size: 1.5rem; font-weight: 600; margin-top: 1rem; }
        p { color: var(--muted); margin-top: 0.5rem; line-height: 1.5; }

        a {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1.75rem;
            padding: 0.75rem 1.5rem;
            background: var(--primary);
            color: #ffffff;
            text-decoration: none;
            border-radius: 0.75rem;
            font-weight: 500;
            transition: background 0.2s ease, transform 0.2s ease;
        }

        a:hover { background: var(--primary-hover); transform: translateY(-1px); }

        @media (max-width: 480px) {
            .card { padding: 2rem; }
            .code { font-size: 5rem; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="glow"></div>
        <div class="card">
            <div class="code">404</div>
            <h1>Page Not Found</h1>
            <p>The page you're looking for doesn't exist or has been moved.</p>
            <a href="{{ url('/') }}">Go Home</a>
        </div>
    </div>
</body>
</html>
