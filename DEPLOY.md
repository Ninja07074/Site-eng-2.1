============================================================
  GUIA DE DEPLOY — Git + Render + Vercel
============================================================


============ PASSO 1 — SUBIR NO GITHUB =====================

1. Crie um repositório no GitHub (pode ser privado)
   → github.com → "New repository"

2. No terminal, na pasta "Site eng 2.1":

   git init
   git add .
   git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
   git push -u origin main

⚠️  O arquivo application-local.properties com suas senhas
   NÃO será enviado (já está no .gitignore).


============ PASSO 2 — DEPLOY DO BACKEND NO RENDER =========

1. Acesse https://render.com e crie uma conta (pode usar GitHub)

2. Clique em "New +" → "Web Service"

3. Conecte seu repositório do GitHub

4. Configure:
   - Name: backend-cursos (ou o nome que quiser)
   - Root Directory: backend/backend
   - Environment: Docker
   - Instance Type: Free

5. Em "Environment Variables", adicione:

   DB_URL        = jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
   DB_USERNAME   = postgres.rqlglzfgqmnhdoxtpeek
   DB_PASSWORD   = Hugopberto1!

6. Clique em "Create Web Service"

7. Aguarde o build (pode demorar ~5 min na primeira vez)

8. Anote a URL gerada, ex:
   https://backend-cursos.onrender.com


============ PASSO 3 — DEPLOY DO FRONTEND NA VERCEL =========

1. Acesse https://vercel.com e crie uma conta (pode usar GitHub)

2. Clique em "Add New..." → "Project"

3. Importe o mesmo repositório do GitHub

4. Configure:
   - Framework Preset: Next.js (detecta automaticamente)
   - Root Directory: frontend-next

5. Em "Environment Variables", adicione:

   NEXT_PUBLIC_API_URL = https://backend-cursos.onrender.com
   (use a URL que o Render gerou no passo anterior)

6. Clique em "Deploy"

7. Aguarde o build (~2 min)

8. Sua URL final será algo como:
   https://seu-projeto.vercel.app


============ PASSO 4 — CONFIGURAR CORS NO RENDER ============

Depois que a Vercel gerar sua URL, você precisa adicionar
mais uma variável de ambiente no Render:

1. Vá no Render → seu Web Service → Environment

2. Adicione:
   FRONTEND_URL = https://seu-projeto.vercel.app

3. Clique "Save Changes" — o Render vai reiniciar automaticamente


============ RESUMO FINAL ==================================

                ┌─────────────┐
  Usuário  ───→ │   Vercel    │  (Frontend Next.js)
                │  :3000/web  │
                └──────┬──────┘
                       │ API calls
                       ▼
                ┌─────────────┐
                │   Render    │  (Backend Spring Boot)
                │   :8080     │
                └──────┬──────┘
                       │ SQL
                       ▼
                ┌─────────────┐
                │  Supabase   │  (Banco PostgreSQL)
                │  (já existe)│
                └─────────────┘

============ RODAR LOCAL (desenvolvimento) ==================

Para rodar localmente APÓS essas mudanças:

Terminal 1 (Backend):
   cd backend\backend
   .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"

Terminal 2 (Frontend):
   cd frontend-next
   npm run dev

============================================================
