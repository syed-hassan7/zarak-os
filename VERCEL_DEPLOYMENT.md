# Deploying ZARAK_OS to Vercel

Vercel is the creator of Next.js and provides world-class hosting for React/Vite applications like ZARAK_OS. It requires zero configuration files and provides an incredibly smooth experience.

Here is the complete, step-by-step process of taking your code from your local machine, pushing it to GitHub, and making it live on the internet via Vercel.

---

## Phase 1: Uploading to GitHub

Before Vercel can host your code, it needs to live on GitHub.

### Step 1: Create a GitHub Repository
1. Log in to your [GitHub account](https://github.com/).
2. Click the **+** icon in the top right and select **New repository**.
3. Name the repository `zarak-os` (or anything else you prefer).
4. Make sure it is set to **Public** (so anyone can see your portfolio).
5. Do **NOT** check "Add a README file" or ".gitignore" (we already have those).
6. Click **Create repository**.

### Step 2: Push Your Local Code to GitHub
Open your terminal (inside your `szh-os-project` folder) and run these exact commands one by one to link your local code to the repository you just created:

```bash
# 1. Initialize a git repository (if you haven't already)
git init

# 2. Stage all your project files to be saved
git add .

# 3. Create your first commit
git commit -m "Initial commit: Deploying ZARAK_OS"

# 4. Ensure your main branch is called 'main'
git branch -M main

# 5. Connect your local folder to your remote GitHub repo
# (IMPORTANT: Replace 'your-username' with your actual GitHub username below)
git remote add origin https://github.com/your-username/zarak-os.git

# 6. Push the code up to GitHub!
git push -u origin main
```

*(Note: If Git asks you to log in during step 6, follow the prompts in your browser to authenticate).*

---

## Phase 2: Deploying with Vercel

Now that your code is safely on GitHub, deploying is incredibly easy.

### Step 3: Create a Vercel Account
1. Go to [Vercel.com](https://vercel.com/signup).
2. Click **Continue with GitHub**. This securely links Vercel to your Github repositories.

### Step 4: Import Your Project
1. Once logged into Vercel, you should be on your Dashboard.
2. Click the black **Add New...** button and select **Project**.
3. Under the "Import Git Repository" section, you should see your newly created `zarak-os` repository listed.
4. Click the **Import** button next to it.

### Step 5: Configure and Deploy
Vercel is smart enough to detect that you built this using Vite. It will automatically populate all the correct build settings.

1. **Project Name:** Leave it as `zarak-os` (this will become your URL: `zarak-os.vercel.app`).
2. **Framework Preset:** Vercel will automatically select **Vite**. Leave it as is.
3. Click the shiny **Deploy** button.

### Step 6: Watch the Magic
Vercel will now automatically install your dependencies, build the 3D environment, and deploy it to their global edge network. This usually takes about 30–60 seconds.

Once finished, you will see a massive **"Congratulations!"** screen.

Click on your new URL (e.g., `https://zarak-os.vercel.app`) to see ZARAK_OS live on the internet! 🚀

---

## What Happens When You Update Code?
The best part about Vercel? You **never have to do this again**.

If you make CSS changes or update your resume in the codebase, all you do is run this in your terminal:

```bash
git add .
git commit -m "Updated resume"
git push
```

Vercel will automatically detect the new push, build the changes in the background, and seamlessly push the exact changes live to your URL within seconds.
