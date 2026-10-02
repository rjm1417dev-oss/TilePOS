<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maintenance</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center bg-[#f4f1ea] text-[#1f2129]">
    <div class="max-w-md mx-auto p-8 text-center">
        <div class="mb-6 text-6xl">🔧</div>
        <h1 class="mb-2 text-2xl font-bold text-[#1f2129]">Under Maintenance</h1>
        <p class="text-[#525a73]">{{ $message ?? 'We are currently performing scheduled maintenance. Please try again later.' }}</p>
    </div>
</body>
</html>
