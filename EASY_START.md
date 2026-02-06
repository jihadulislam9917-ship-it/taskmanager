# সহজ শুরু করার গাইড (Easy Start Guide)

আপনি যদি ডেভেলপার না হন, সমস্যা নেই। নিচের ধাপগুলো অনুসরণ করে আপনি এই প্রজেক্টটি লাইভ করতে পারবেন।

## ধাপ ১: GitHub-এ কোড আপলোড

১. [github.com](https://github.com)-এ যান এবং একটি একাউন্ট খুলুন (যদি না থাকে)।
২. লগইন করার পর, ডানদিকের কোণায় `+` আইকনে ক্লিক করে **New repository** সিলেক্ট করুন।
৩. Repository name দিন: `taskmanager`
৪. **Public** সিলেক্ট করুন।
৫. **Create repository** বাটনে ক্লিক করুন।
৬. এরপর নিচের কমান্ডগুলো আপনার কম্পিউটারের টার্মিনালে একে একে পেস্ট করুন (Replace `<YOUR_GITHUB_USERNAME>` with your actual username):

```bash
git remote add origin https://github.com/jihadulislam9917-ship-it/taskmanager.git
git branch -M main
git push -u origin main
```

## ধাপ ২: ফ্রি ডাটাবেস খোলা (Neon Tech)

১. [neon.tech](https://neon.tech)-এ যান এবং Sign Up করুন।
২. নতুন প্রজেক্ট তৈরি করুন।
৩. আপনাকে একটি **Connection String** দেওয়া হবে। দেখতে অনেকটা এমন: `postgres://user:password@ep-something.aws.neon.tech/neondb?sslmode=require`
৪. এটি কপি করে কোথাও সেভ করে রাখুন।

psql 'postgresql://neondb_owner:npg_spn6vIQgaHL9@ep-small-dew-a1c0dqyq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

## ধাপ ৩: Vercel-এ ডেপ্লয় করা

১. [vercel.com](https://vercel.com)-এ যান এবং GitHub দিয়ে লগইন করুন।
২. **Add New...** > **Project**-এ ক্লিক করুন।
৩. আপনার `taskmanager` রিপোজিটরি সিলেক্ট করে **Import** করুন।
৪. **Environment Variables** সেকশনে নিচের তথ্যগুলো দিন:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | (Neon থেকে পাওয়া Connection String পেস্ট করুন) |
| `JWT_SECRET` | `secret12345678901234567890123456` (যেকোনো লম্বা পাসওয়ার্ড) |
| `GO_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | (ফাঁকা রাখুন, ডেপ্লয় হওয়ার পর আমরা এটি আপডেট করব) |
| `VITE_API_URL` | (ফাঁকা রাখুন, ডেপ্লয় হওয়ার পর আমরা এটি আপডেট করব) |

৫. **Deploy** বাটনে ক্লিক করুন।

## ধাপ ৪: শেষ কাজ

১. ডেপ্লয় শেষ হলে Vercel আপনাকে ৩টি লিংক দেবে।
   - একটি Frontend এর জন্য (যেমন: `taskmanager.vercel.app`)
   - একটি Backend এর জন্য (যেমন: `taskmanager.vercel.app/api/...`)
   - একটি Admin Panel এর জন্য (যেমন: `taskmanager.vercel.app/admin`)

২. Vercel এর **Settings** > **Environment Variables**-এ যান।
৩. `NEXT_PUBLIC_API_URL` এবং `VITE_API_URL` এর ভ্যালু হিসেবে আপনার ডোমেইন লিংকটি দিন (যেমন: `https://taskmanager.vercel.app/api`)।
৪. **Redeploy** করুন।

অভিনন্দন! আপনার প্রজেক্ট এখন অনলাইনে।
