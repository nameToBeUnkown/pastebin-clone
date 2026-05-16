import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

const LANGUAGES = [
  "typescript", "javascript", "python", "rust", "go", "bash",
  "sql", "yaml", "css", "html", "json", "dockerfile", "java",
  "cpp", "ruby", "php", "swift", "kotlin", "scala", "lua",
];

const PASTE_TEMPLATES: {
  title: string;
  content: string;
  language: string;
}[] = [];

function add(title: string, content: string, language: string) {
  PASTE_TEMPLATES.push({ title, content, language });
}

add("QuickSort in Python", `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

if __name__ == "__main__":
    data = [3, 6, 8, 10, 1, 2, 1]
    print(quicksort(data))
`, "python");

add("Binary Search in Python", `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binary_search(arr, 23))
`, "python");

add("Flask REST API Template", `from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
db = SQLAlchemy(app)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

@app.route("/api/items", methods=["GET"])
def get_items():
    items = Item.query.all()
    return jsonify([{"id": i.id, "name": i.name} for i in items])

@app.route("/api/items", methods=["POST"])
def create_item():
    data = request.get_json()
    item = Item(name=data["name"])
    db.session.add(item)
    db.session.commit()
    return jsonify({"id": item.id, "name": item.name}), 201

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
`, "python");

add("Python Data Class Example", `from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class User:
    id: int
    name: str
    email: str
    created_at: datetime
    tags: List[str] = None


@dataclass
class Post:
    title: str
    content: str
    author: User
    published: bool = False
    published_at: Optional[datetime] = None


def create_sample_post() -> Post:
    author = User(
        id=1,
        name="Alice",
        email="alice@example.com",
        created_at=datetime.now(),
        tags=["python", "dataclasses"],
    )
    return Post(
        title="Hello World",
        content="This is a sample post.",
        author=author,
    )
`, "python");

add("Python Async Web Scraper", `import asyncio
import aiohttp
from bs4 import BeautifulSoup


async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()


async def scrape_titles(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        pages = await asyncio.gather(*tasks)
        titles = []
        for html in pages:
            soup = BeautifulSoup(html, "html.parser")
            title = soup.title.string if soup.title else "No title"
            titles.append(title)
        return titles


urls = [
    "https://example.com",
    "https://httpbin.org/html",
    "https://httpstat.us/200",
]
result = asyncio.run(scrape_titles(urls))
print(result)
`, "python");

add("useLocalStorage Hook", `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
`, "typescript");

add("TypeScript Utility Types", `type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type NonEmptyArray<T> = [T, ...T[]];

type PickByType<T, V> = {
  [P in keyof T as T[P] extends V ? P : never]: T[P];
};

type StringKeys<T> = PickByType<T, string>;

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  metadata: { role: string };
}

type PartialUser = DeepPartial<User>;
type StringFields = StringKeys<User>;
`, "typescript");

add("Express.js Middleware Chain", `import express, { Request, Response, NextFunction } from "express";

const app = express();

function logger(req: Request, _res: Response, next: NextFunction) {
  console.log(\`\${req.method} \${req.url} - \${new Date().toISOString()}\`);
  next();
}

function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function rateLimit(ms: number) {
  const lastRequest = new Map<string, number>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const last = lastRequest.get(req.ip!) || 0;
    if (now - last < ms) {
      return res.status(429).json({ error: "Too Many Requests" });
    }
    lastRequest.set(req.ip!, now);
    next();
  };
}

app.use(logger);
app.use("/api", auth);
app.use("/api", rateLimit(1000));

app.get("/", (_req, res) => res.send("Hello World"));
app.listen(3000);
`, "typescript");

add("Zod Schema Validation", `import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(["admin", "user", "viewer"]).default("user"),
  tags: z.array(z.string()).max(5).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export function validateUser(data: unknown) {
  const result = createUserSchema.safeParse(data);
  if (!result.success) {
    console.error(result.error.flatten());
    return null;
  }
  return result.data;
}
`, "typescript");

add("React Data Fetching Hook", `import { useState, useEffect } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json() as Promise<T>;
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}
`, "typescript");

add("Docker Compose for PG + Redis", `version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
`, "yaml");

add("Kubernetes Deployment + Service", `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: app
          image: myapp:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
`, "yaml");

add("GitHub Actions CI Pipeline", `name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
`, "yaml");

add("Simple Go HTTP Server", `package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
    })
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", helloHandler)
    wrapped := loggingMiddleware(mux)
    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", wrapped))
}
`, "go");

add("Go REST API with Gin", `package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type Todo struct {
    ID    int    \`json:"id"\`
    Title string \`json:"title"\`
    Done  bool   \`json:"done"\`
}

var todos = []Todo{}
var nextID = 1

func main() {
    r := gin.Default()

    r.GET("/api/todos", func(c *gin.Context) {
        c.JSON(http.StatusOK, todos)
    })

    r.POST("/api/todos", func(c *gin.Context) {
        var todo Todo
        if err := c.ShouldBindJSON(&todo); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        todo.ID = nextID
        nextID++
        todos = append(todos, todo)
        c.JSON(http.StatusCreated, todo)
    })

    r.DELETE("/api/todos/:id", func(c *gin.Context) {
        id := c.Param("id")
        for i, t := range todos {
            if fmt.Sprintf("%d", t.ID) == id {
                todos = append(todos[:i], todos[i+1:]...)
                c.Status(http.StatusNoContent)
                return
            }
        }
        c.Status(http.StatusNotFound)
    })

    r.Run(":8080")
}
`, "go");

add("Go Concurrency Patterns", `package main

import (
    "fmt"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        fmt.Printf("Worker %d processing job %d\\n", id, job)
        time.Sleep(time.Second)
        results <- job * 2
    }
}

func main() {
    const numJobs = 10
    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)

    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs)

    for a := 1; a <= numJobs; a++ {
        <-results
    }
}
`, "go");

add("Go Unit Test Example", `package main

import (
    "testing"
    "net/http"
    "net/http/httptest"
)

func TestHelloHandler(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/World", nil)
    rec := httptest.NewRecorder()

    helloHandler(rec, req)

    if rec.Code != http.StatusOK {
        t.Errorf("expected 200, got %d", rec.Code)
    }

    expected := "Hello, World!"
    if rec.Body.String() != expected {
        t.Errorf("expected %q, got %q", expected, rec.Body.String())
    }
}

func TestSum(t *testing.T) {
    cases := []struct {
        a, b, expected int
    }{
        {1, 2, 3},
        {0, 0, 0},
        {-1, 1, 0},
        {100, 200, 300},
    }
    for _, c := range cases {
        result := sum(c.a, c.b)
        if result != c.expected {
            t.Errorf("sum(%d, %d) = %d, want %d", c.a, c.b, result, c.expected)
        }
    }
}
`, "go");

add("CSS Grid Dashboard Layout", `.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  height: 100vh;
}

.header {
  grid-area: header;
  background: #1a1a2e;
  color: #eee;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar {
  grid-area: sidebar;
  background: #16213e;
  color: #a0a0b0;
  padding: 1rem;
}

.main {
  grid-area: main;
  background: #f0f0f5;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
    grid-template-areas:
      "header"
      "sidebar"
      "main";
  }
}
`, "css");

add("CSS Animation Library", `@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
`, "css");

add("SQL Window Functions", `-- Rank employees by salary per department
SELECT
    name,
    department,
    salary,
    RANK() OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS salary_rank
FROM employees;

-- Running total of sales by month
SELECT
    month,
    amount,
    SUM(amount) OVER (
        ORDER BY month
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM monthly_sales;

-- Moving average (3-month)
SELECT
    month,
    amount,
    AVG(amount) OVER (
        ORDER BY month
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_3mo
FROM monthly_sales;
`, "sql");

add("Database Schema for Blog", `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);
`, "sql");

add("Bash Backup Script", `#!/bin/bash

BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
SOURCE_DIR="/var/www"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/www.tar.gz" "$SOURCE_DIR"

find /backups -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \\;

echo "Backup complete: $BACKUP_DIR"
`, "bash");

add("Bash System Monitor", `#!/bin/bash

echo "=== System Monitor ==="
echo "Uptime: $(uptime -p)"
echo ""

echo "=== CPU Usage ==="
top -bn1 | grep "Cpu(s)" | awk '{print "CPU: " $2 "% user, " $4 "% system"}'
echo ""

echo "=== Memory Usage ==="
free -h | awk '/^Mem:/ {print "Used: " $3 " / " $2}'
echo ""

echo "=== Disk Usage ==="
df -h / | awk 'NR==2 {print "Used: " $3 " / " $2 " (" $5 ")"}'
echo ""

echo "=== Top 5 Processes by Memory ==="
ps aux --sort=-%mem | head -6
`, "bash");

add("Rust Error Handling", `use std::fs;
use std::io;
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(ParseIntError),
    NotFound(String),
}

impl From<io::Error> for AppError {
    fn from(e: io::Error) -> Self {
        AppError::Io(e)
    }
}

impl From<ParseIntError> for AppError {
    fn from(e: ParseIntError) -> Self {
        AppError::Parse(e)
    }
}

fn read_number_from_file(path: &str) -> Result<i32, AppError> {
    let content = fs::read_to_string(path)?;
    let num = content.trim().parse::<i32>()?;
    Ok(num)
}

fn main() -> Result<(), AppError> {
    match read_number_from_file("data.txt") {
        Ok(n) => println!("Number: {}", n),
        Err(AppError::NotFound(p)) => eprintln!("File not found: {}", p),
        Err(e) => eprintln!("Error: {:?}", e),
    }
    Ok(())
}
`, "rust");

add("Rust CLI with Clap", `use clap::Parser;

#[derive(Parser)]
#[command(name = "greet", about = "A simple greeting CLI")]
struct Args {
    #[arg(short, long)]
    name: String,

    #[arg(short, long, default_value_t = 1)]
    count: u32,

    #[arg(short, long)]
    uppercase: bool,
}

fn main() {
    let args = Args::parse();
    let greeting = format!("Hello, {}!", args.name);
    let greeting = if args.uppercase {
        greeting.to_uppercase()
    } else {
        greeting
    };
    for _ in 0..args.count {
        println!("{}", greeting);
    }
}
`, "rust");

add("HTML Email Template", `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table role="presentation" style="width:100%;max-width:600px;margin:auto;">
    <tr>
      <td style="padding:40px 20px;background:linear-gradient(135deg,#667eea,#764ba2);text-align:center;">
        <h1 style="color:#fff;margin:0;">Welcome!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 20px;background:#fff;">
        <p>Hi {{name}},</p>
        <p>Thanks for joining! Click the button below to verify your email.</p>
        <p style="text-align:center;">
          <a href="{{verify_url}}" style="display:inline-block;padding:12px 24px;background:#667eea;color:#fff;text-decoration:none;border-radius:4px;">
            Verify Email
          </a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;text-align:center;color:#888;font-size:12px;">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`, "html");

add("JavaScript Debounce Function", `function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const handleSearch = debounce((query) => {
  console.log("Searching:", query);
}, 300);

const handleScroll = throttle(() => {
  console.log("Scrolled at", new Date().toISOString());
}, 1000);
`, "javascript");

add("Node.js File Watcher", `import fs from "fs";
import path from "path";

function watchDirectory(dirPath) {
  const watched = new Set();

  function watchRecursive(dir) {
    fs.readdirSync(dir).forEach((entry) => {
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          watchRecursive(fullPath);
        }
      } catch { }
    });

    if (!watched.has(dir)) {
      watched.add(dir);
      fs.watch(dir, (eventType, filename) => {
        console.log(\`[\${new Date().toLocaleTimeString()}] \${eventType}: \${filename}\`);
      });
    }
  }

  watchRecursive(dirPath);
  console.log(\`Watching \${dirPath} for changes...\`);
}

watchDirectory(process.argv[2] || ".");
`, "javascript");

add("JSON API Response Format", `{
  "version": "2.0",
  "status": "success",
  "data": {
    "users": [
      {
        "id": "usr_01j",
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "role": "admin",
        "profile": {
          "avatar": "https://api.example.com/avatars/usr_01j",
          "joined": "2024-01-15T08:00:00Z"
        }
      },
      {
        "id": "usr_02k",
        "name": "Bob Chen",
        "email": "bob@example.com",
        "role": "user",
        "profile": {
          "avatar": null,
          "joined": "2024-03-22T14:30:00Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 42,
      "total_pages": 3
    }
  }
}
`, "json");

add("Dockerfile Multi-stage Build", `# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system app && adduser --system app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER app
EXPOSE 3000
CMD ["node", "dist/index.js"]
`, "dockerfile");

add("Java Spring Boot Controller", `package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
    }
}
`, "java");

add("C++ Smart Pointer Example", `#include <iostream>
#include <memory>
#include <vector>

class Observable {
public:
    virtual ~Observable() = default;
    virtual void observe() const = 0;
};

class DataSource : public Observable {
    std::string name_;
public:
    explicit DataSource(std::string name) : name_(std::move(name)) {}
    void observe() const override {
        std::cout << "Observing: " << name_ << std::endl;
    }
};

int main() {
    std::vector<std::unique_ptr<Observable>> sources;
    sources.push_back(std::make_unique<DataSource>("Sensor A"));
    sources.push_back(std::make_unique<DataSource>("Sensor B"));
    sources.push_back(std::make_unique<DataSource>("Sensor C"));

    for (const auto& src : sources) {
        src->observe();
    }

    auto shared = std::make_shared<DataSource>("Shared Source");
    std::cout << "Use count: " << shared.use_count() << std::endl;
    {
        auto copy = shared;
        std::cout << "Use count: " << shared.use_count() << std::endl;
    }
    std::cout << "Use count: " << shared.use_count() << std::endl;
}
`, "cpp");

add("PHP Laravel Controller", `<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    public function index()
    {
        return Post::with('author')
            ->latest()
            ->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'tags' => 'array',
        ]);

        $post = $request->user()->posts()->create($validated);

        if ($request->has('tags')) {
            $post->tags()->sync($request->tags);
        }

        return response()->json($post, 201);
    }

    public function show(Post $post)
    {
        Gate::authorize('view', $post);
        return $post->load('comments.author');
    }

    public function update(Request $request, Post $post)
    {
        Gate::authorize('update', $post);
        $post->update($request->only('title', 'content'));
        return $post;
    }
}
`, "php");

add("Ruby on Rails API", `class Api::V1::ArticlesController < ApplicationController
  before_action :set_article, only: [:show, :update, :destroy]

  def index
    articles = Article.includes(:author).page(params[:page])
    render json: ArticleSerializer.new(articles).serializable_hash
  end

  def show
    render json: ArticleSerializer.new(@article, include: [:comments]).serializable_hash
  end

  def create
    article = current_user.articles.build(article_params)
    if article.save
      render json: ArticleSerializer.new(article), status: :created
    else
      render json: { errors: article.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @article.update(article_params)
      render json: ArticleSerializer.new(@article)
    else
      render json: { errors: @article.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @article.destroy
    head :no_content
  end

  private

  def set_article
    @article = Article.find(params[:id])
  end

  def article_params
    params.require(:article).permit(:title, :body, :published)
  end
end
`, "ruby");

add("Swift MVVM Pattern", `import SwiftUI
import Combine

class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var error: Error?
    private var cancellables = Set<AnyCancellable>()

    func fetchUsers() {
        isLoading = true
        API.shared.fetchUsers()
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.error = error
                }
            } receiveValue: { [weak self] users in
                self?.users = users
            }
            .store(in: &cancellables)
    }
}

struct UserListView: View {
    @StateObject var viewModel = UserViewModel()

    var body: some View {
        NavigationView {
            List(viewModel.users) { user in
                VStack(alignment: .leading) {
                    Text(user.name).font(.headline)
                    Text(user.email).font(.caption).foregroundColor(.secondary)
                }
            }
            .navigationTitle("Users")
            .task { viewModel.fetchUsers() }
        }
    }
}
`, "swift");

add("Kotlin Coroutines Example", `import kotlinx.coroutines.*
import kotlin.system.measureTimeMillis

suspend fun fetchUser(id: Int): String {
    delay(1000)
    return "User \$id"
}

suspend fun fetchUsers(): List<String> = coroutineScope {
    val ids = listOf(1, 2, 3, 4, 5)
    val deferreds = ids.map { async { fetchUser(it) } }
    deferreds.awaitAll()
}

fun main() = runBlocking {
    val time = measureTimeMillis {
        val users = fetchUsers()
        users.forEach { println(it) }
    }
    println("Fetched in \$time ms")
}
`, "kotlin");

add("Lua Configuration Script", `-- Nginx style config parser
local Config = {}
Config.__index = Config

function Config:new()
    return setmetatable({sections = {}}, self)
end

function Config:add_section(name)
    local section = {name = name, values = {}}
    table.insert(self.sections, section)
    return section
end

function Config:parse_file(path)
    local file = io.open(path, "r")
    if not file then
        error("Cannot open: " .. path)
    end

    local current_section = nil
    for line in file:lines() do
        local trimmed = line:match("^%s*(.-)%s*$")
        if trimmed ~= "" and not trimmed:match("^#") then
            local section_name = trimmed:match("%[(.+)%]")
            if section_name then
                current_section = self:add_section(section_name)
            elseif current_section then
                local key, value = trimmed:match("^(.-)%s*=%s*(.-)$")
                if key then
                    current_section.values[key] = value
                end
            end
        end
    end

    file:close()
end

local config = Config:new()
config:parse_file("app.conf")
`, "lua");

add("Node.js Express Auth Middleware", `const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
`, "javascript");

add("Python Pathlib Examples", `from pathlib import Path
import shutil

def organize_downloads():
    downloads = Path.home() / "Downloads"
    for ext_dir in ["images", "documents", "archives", "code"]:
        (downloads / ext_dir).mkdir(exist_ok=True)

    category_map = {
        ".jpg": "images", ".jpeg": "images", ".png": "images", ".gif": "images",
        ".pdf": "documents", ".docx": "documents", ".txt": "documents",
        ".zip": "archives", ".tar.gz": "archives", ".rar": "archives",
        ".py": "code", ".js": "code", ".ts": "code", ".html": "code",
    }

    for file in downloads.iterdir():
        if file.is_file():
            dest_dir = category_map.get(file.suffix.lower())
            if dest_dir:
                shutil.move(str(file), str(downloads / dest_dir / file.name))
                print(f"Moved: {file.name} -> {dest_dir}")

if __name__ == "__main__":
    organize_downloads()
`, "python");

add("Tailwind CSS Component", `export function Card({ title, children, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        "dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
    >
      {title && (
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
`, "typescript");

add("Python SQLAlchemy Models", `from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime, timezone

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")
    tags = relationship("Tag", secondary="post_tags")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True)
    name = Column(String(30), unique=True, nullable=False)

class PostTag(Base):
    __tablename__ = "post_tags"

    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

engine = create_engine("sqlite:///blog.db")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
`, "python");

add("TypeScript Generics Examples", `function identity<T>(arg: T): T {
  return arg;
}

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };
}

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type PaginatedResponse<T> = ApiResponse<T> & {
  page: number;
  totalPages: number;
  totalItems: number;
};

interface User {
  id: number;
  name: string;
  email: string;
}

const response: PaginatedResponse<User[]> = {
  data: [{ id: 1, name: "Alice", email: "alice@example.com" }],
  status: 200,
  message: "Success",
  page: 1,
  totalPages: 5,
  totalItems: 42,
};
`, "typescript");

add("ESLint Flat Config", `import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: ["dist/", "node_modules/", "*.config.*"],
  },
);
`, "javascript");

add("Terraform AWS Infrastructure", `provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "main-vpc" }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index}.0/24"
  availability_zone = element(["us-east-1a", "us-east-1b"], count.index)
  map_public_ip_on_launch = true
  tags = { Name = "public-subnet-\${count.index}" }
}

resource "aws_ecs_cluster" "app" {
  name = "app-cluster"
}

resource "aws_ecs_service" "app" {
  name            = "app-service"
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = aws_subnet.public[*].id
    assign_public_ip = true
  }
}
`, "yaml");

add("Prometheus Monitoring Config", `global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "api"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["api:3000"]
        labels:
          service: "api"
          environment: "production"

  - job_name: "node"
    static_configs:
      - targets:
          - "node-exporter:9100"
`, "yaml");

add("PostgreSQL Recursive CTE", `WITH RECURSIVE org_tree AS (
    -- Base case: top-level employees
    SELECT
        id,
        name,
        manager_id,
        0 AS level,
        ARRAY[id] AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive case: direct reports
    SELECT
        e.id,
        e.name,
        e.manager_id,
        ot.level + 1,
        ot.path || e.id
    FROM employees e
    JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT
    level,
    repeat('  ', level) || name AS indented_name,
    path
FROM org_tree
ORDER BY path;
`, "sql");

add("Python FastAPI App", `from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import jwt

app = FastAPI()
security = HTTPBearer()

class Item(BaseModel):
    name: str
    price: float
    description: Optional[str] = None

items_db = {}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, "secret", algorithms=["HS256"])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]

@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(item: Item, user: str = Depends(get_current_user)):
    item_id = len(items_db) + 1
    items_db[item_id] = item.model_dump()
    return {"id": item_id, **item.model_dump()}
`, "python");

add("React Context with useReducer", `import React, { createContext, useContext, useReducer } from "react";

type State = {
  user: { id: string; name: string } | null;
  theme: "light" | "dark";
};

type Action =
  | { type: "LOGIN"; payload: { id: string; name: string } }
  | { type: "LOGOUT" }
  | { type: "SET_THEME"; payload: "light" | "dark" };

const initialState: State = {
  user: null,
  theme: "light",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
`, "typescript");

add("Python Decorator Examples", `import time
import functools
import logging

logging.basicConfig(level=logging.INFO)

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logging.info(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

def retry(max_attempts=3, delay=1):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    logging.warning(f"Attempt {attempt + 1} failed: {e}")
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

@timer
@retry(max_attempts=3)
def fetch_data(url):
    print(f"Fetching {url}...")
    raise ConnectionError("Timeout")

fetch_data("https://example.com")
`, "python");

add("Next.js API Route", `import { NextResponse } from "next/server";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().optional().default(false),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: posts, page, limit });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const post = await prisma.post.create({
    data: parsed.data,
  });

  return NextResponse.json({ data: post }, { status: 201 });
}
`, "typescript");

add("Scala Functional Programming", `object FunctionalUtils {
  def memoize[A, B](f: A => B): A => B = {
    val cache = scala.collection.mutable.Map.empty[A, B]
    a => cache.getOrElseUpdate(a, f(a))
  }

  val fibonacci: Int => BigInt = memoize {
    case 0 => 0
    case 1 => 1
    case n => fibonacci(n - 1) + fibonacci(n - 2)
  }

  def partition[A](pred: A => Boolean, list: List[A]): (List[A], List[A]) = {
    list.foldRight((List.empty[A], List.empty[A])) {
      case (elem, (pass, fail)) =>
        if (pred(elem)) (elem :: pass, fail)
        else (pass, elem :: fail)
    }
  }

  def main(args: Array[String]): Unit = {
    println(fibonacci(100))

    val nums = List(1, 2, 3, 4, 5, 6)
    val (evens, odds) = partition((n: Int) => n % 2 == 0, nums)
    println(s"Evens: $evens, Odds: $odds")
  }
}
`, "scala");

add("Ansible Playbook Example", `---
- name: Deploy web application
  hosts: webservers
  become: yes
  vars:
    app_port: 3000
    node_version: "22"

  tasks:
    - name: Install system dependencies
      apt:
        name:
          - curl
          - git
          - nginx
        state: present
        update_cache: yes

    - name: Install Node.js
      shell: |
        curl -fsSL https://deb.nodesource.com/setup_{{ node_version }}.x | bash -
        apt-get install -y nodejs

    - name: Clone repository
      git:
        repo: "https://github.com/org/myapp.git"
        dest: /opt/myapp
        version: main

    - name: Install dependencies
      npm:
        path: /opt/myapp
        ci: yes

    - name: Build application
      command: npm run build
      args:
        chdir: /opt/myapp

    - name: Configure nginx
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-available/myapp
      notify: restart nginx

    - name: Enable site
      file:
        src: /etc/nginx/sites-available/myapp
        dest: /etc/nginx/sites-enabled/myapp
        state: link

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
`, "yaml");

add("Go Testing Benchmarks", `package main

import (
    "testing"
)

func BenchmarkSum(b *testing.B) {
    nums := make([]int, 1000)
    for i := range nums {
        nums[i] = i
    }
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        sum(nums)
    }
}

func BenchmarkConcurrentSum(b *testing.B) {
    nums := make([]int, 1000)
    for i := range nums {
        nums[i] = i
    }
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        concurrentSum(nums, 4)
    }
}
`, "go");

add("Python Async Context Manager", `import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def database_connection(url):
    print(f"Connecting to {url}...")
    conn = {"url": url, "connected": True}
    try:
        yield conn
    finally:
        print("Closing connection...")
        conn["connected"] = False

@asynccontextmanager
async def transaction(conn):
    print("Beginning transaction...")
    conn["in_transaction"] = True
    try:
        yield conn
    except Exception:
        print("Rolling back...")
        conn["in_transaction"] = False
        raise
    else:
        print("Committing...")
        conn["in_transaction"] = False

async def main():
    async with database_connection("postgresql://localhost/mydb") as conn:
        async with transaction(conn):
            print("Doing work...")

asyncio.run(main())
`, "python");

add("React Testing with Vitest", `import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("renders initial count of 0", () => {
    render(<Counter />);
    expect(screen.getByText("Count: 0")).toBeDefined();
  });

  it("increments count on click", async () => {
    render(<Counter />);
    const button = screen.getByRole("button", { name: /increment/i });
    await userEvent.click(button);
    expect(screen.getByText("Count: 1")).toBeDefined();
  });

  it("calls onChange when count changes", async () => {
    const onChange = vi.fn();
    render(<Counter onChange={onChange} />);
    const button = screen.getByRole("button", { name: /increment/i });
    await userEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
`, "typescript");

add("CSS Flexbox Patterns", `.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.sticky-footer {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.sticky-footer main {
  flex: 1;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-grid > * {
  flex: 1 1 300px;
}

.sidebar-layout {
  display: flex;
  gap: 2rem;
}

.sidebar-layout aside {
  flex: 0 0 250px;
}

.sidebar-layout main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .sidebar-layout {
    flex-direction: column;
  }
  .sidebar-layout aside {
    flex: none;
  }
}
`, "css");

add("Redis Caching Pattern", `import redis
import json
from functools import wraps

cache = redis.Redis(host="localhost", port=6379, db=0)

def cached(ttl=300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = f"{func.__name__}:{args}:{kwargs}"
            cached_result = cache.get(key)
            if cached_result:
                return json.loads(cached_result)
            result = func(*args, **kwargs)
            cache.setex(key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

@cached(ttl=60)
def get_user_stats(user_id):
    # Simulate expensive query
    return {
        "posts": 42,
        "followers": 128,
        "following": 73,
    }

print(get_user_stats(1))
print(get_user_stats(1))  # From cache
`, "python");

add("Kafka Producer/Consumer", `import json
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError

producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
)

def send_event(topic, event):
    future = producer.send(topic, event)
    try:
        record_metadata = future.get(timeout=10)
        print(f"Sent to {record_metadata.topic}:{record_metadata.partition}")
    except KafkaError as e:
        print(f"Failed: {e}")

consumer = KafkaConsumer(
    "user-events",
    bootstrap_servers=["localhost:9092"],
    group_id="analytics",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="earliest",
)

for message in consumer:
    event = message.value
    print(f"Received: {event}")
`, "python");

add("React Portals Modal", `import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-lg shadow-xl backdrop:bg-black/50 p-6 max-w-md"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
      {children}
    </dialog>,
    document.getElementById("modal-root")!,
  );
}
`, "typescript");

add("Python Unit Tests with Pytest", `import pytest
from datetime import datetime, timezone

def create_user(name, email):
    if not name or not email:
        raise ValueError("Name and email are required")
    if "@" not in email:
        raise ValueError("Invalid email")
    return {
        "id": hash(email) % 100000,
        "name": name,
        "email": email,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

class TestCreateUser:
    def test_valid_user(self):
        user = create_user("Alice", "alice@example.com")
        assert user["name"] == "Alice"
        assert user["email"] == "alice@example.com"
        assert "id" in user
        assert "created_at" in user

    def test_empty_name(self):
        with pytest.raises(ValueError, match="Name and email are required"):
            create_user("", "alice@example.com")

    def test_invalid_email(self):
        with pytest.raises(ValueError, match="Invalid email"):
            create_user("Alice", "not-an-email")
`, "python");

add("Nginx Reverse Proxy Config", `upstream app_servers {
    least_conn;
    server app1:3000 max_fails=3 fail_timeout=30s;
    server app2:3000 max_fails=3 fail_timeout=30s;
    server app3:3000 backup;
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/ssl/certs/example.com.pem;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    location /api {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
    }

    location /static/ {
        root /var/www/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
`, "yaml");

add("Django REST Framework Views", `from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Article, Category
from .serializers import ArticleSerializer, CategorySerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related("author", "category").all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category__slug", "published", "author"]
    search_fields = ["title", "content"]
    ordering_fields = ["created_at", "title"]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        article = self.get_object()
        article.published = True
        article.save()
        return Response({"status": "published"})

    @action(detail=False)
    def drafts(self, request):
        drafts = self.get_queryset().filter(author=request.user, published=False)
        serializer = self.get_serializer(drafts, many=True)
        return Response(serializer.data)
`, "python");

add("C++ RAII Example", `#include <iostream>
#include <fstream>
#include <string>
#include <stdexcept>

class FileHandler {
    std::fstream file_;
    std::string filename_;

public:
    FileHandler(const std::string& filename, std::ios::openmode mode)
        : filename_(filename) {
        file_.open(filename, mode);
        if (!file_.is_open()) {
            throw std::runtime_error("Cannot open file: " + filename);
        }
        std::cout << "Opened: " << filename_ << std::endl;
    }

    ~FileHandler() {
        if (file_.is_open()) {
            file_.close();
            std::cout << "Closed: " << filename_ << std::endl;
        }
    }

    FileHandler(const FileHandler&) = delete;
    FileHandler& operator=(const FileHandler&) = delete;

    FileHandler(FileHandler&& other) noexcept
        : file_(std::move(other.file_)), filename_(std::move(other.filename_)) {}

    void write(const std::string& data) {
        if (!file_.is_open()) {
            throw std::runtime_error("File not open");
        }
        file_ << data;
    }

    std::string read() {
        if (!file_.is_open()) {
            throw std::runtime_error("File not open");
        }
        std::string content;
        file_.seekg(0);
        content.assign(std::istreambuf_iterator<char>(file_),
                       std::istreambuf_iterator<char>());
        return content;
    }
};

int main() {
    try {
        FileHandler fh("test.txt", std::ios::out | std::ios::in | std::ios::trunc);
        fh.write("Hello, RAII!");
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
}
`, "cpp");

add("WebSocket Chat Server", `import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map<WebSocket, { name: string }>();

wss.on("connection", (ws) => {
  clients.set(ws, { name: "Anonymous" });

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case "set_name":
        clients.set(ws, { name: message.name });
        broadcast({ type: "system", text: \`\${message.name} joined the chat\` });
        break;

      case "message":
        const sender = clients.get(ws);
        broadcast({
          type: "message",
          author: sender?.name ?? "Unknown",
          text: message.text,
          timestamp: new Date().toISOString(),
        });
        break;
    }
  });

  ws.on("close", () => {
    const user = clients.get(ws);
    clients.delete(ws);
    if (user) {
      broadcast({ type: "system", text: \`\${user.name} left the chat\` });
    }
  });
});

function broadcast(data: object) {
  const message = JSON.stringify(data);
  for (const client of clients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

console.log("WebSocket server running on ws://localhost:8080");
`, "typescript");

add("Python Metaclass Example", `class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class Logger(metaclass=SingletonMeta):
    def __init__(self):
        self.logs = []

    def log(self, message):
        self.logs.append(message)
        print(f"[LOG] {message}")


class ValidatedMeta(type):
    def __new__(mcs, name, bases, namespace):
        # Ensure all methods have docstrings
        for key, value in namespace.items():
            if callable(value) and not value.__doc__:
                raise TypeError(f"{name}.{key} must have a docstring")
        return super().__new__(mcs, name, bases, namespace)


class MyService(metaclass=ValidatedMeta):
    def process(self):
        "Process the data"
        pass

    def validate(self):
        "Validate the input"
        pass

a = Logger()
b = Logger()
print(a is b)  # True
`, "python");

add("JavaScript Array Polyfills", `// Polyfill Array.prototype.map
if (!Array.prototype.map) {
  Array.prototype.map = function (callback, thisArg) {
    const result = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      if (i in this) {
        result[i] = callback.call(thisArg, this[i], i, this);
      }
    }
    return result;
  };
}

// Polyfill Array.prototype.reduce
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function (callback, initialValue) {
    let accumulator = initialValue;
    let startIndex = 0;

    if (arguments.length < 2) {
      if (this.length === 0) throw new TypeError("Reduce of empty array with no initial value");
      accumulator = this[0];
      startIndex = 1;
    }

    for (let i = startIndex; i < this.length; i++) {
      if (i in this) {
        accumulator = callback(accumulator, this[i], i, this);
      }
    }

    return accumulator;
  };
}
`, "javascript");

add("Prisma Schema with Relations", `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  users     User[]
  projects  Project[]
  createdAt DateTime @default(now())
}

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  name           String
  role           Role         @default(MEMBER)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  tasks          Task[]
  createdAt      DateTime     @default(now())

  @@index([organizationId])
}

model Project {
  id             String       @id @default(cuid())
  name           String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  tasks          Task[]
  createdAt      DateTime     @default(now())

  @@index([organizationId])
}

model Task {
  id          String   @id @default(cuid())
  title       String
  status      Status   @default(TODO)
  assigneeId  String?
  assignee    User?    @relation(fields: [assigneeId], references: [id])
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  createdAt   DateTime @default(now())

  @@index([assigneeId])
  @@index([projectId])
}

enum Role {
  ADMIN
  MEMBER
  VIEWER
}

enum Status {
  TODO
  IN_PROGRESS
  DONE
}
`, "yaml");

add("GraphQL Schema Definition", `type Query {
  users(page: Int, limit: Int): UserConnection!
  user(id: ID!): User
  posts(search: String, tags: [String]): [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createPost(input: CreatePostInput!): Post!
}

type User {
  id: ID!
  name: String!
  email: String!
  avatar: String
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  slug: String!
  content: String!
  published: Boolean!
  author: User!
  tags: [Tag!]!
  createdAt: String!
  updatedAt: String!
}

type Tag {
  id: ID!
  name: String!
}

type UserConnection {
  edges: [User!]!
  pageInfo: PageInfo!
}

type PageInfo {
  totalCount: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
}

input UpdateUserInput {
  name: String
  avatar: String
}
`, "yaml");

add("Bash Git Automation", `#!/bin/bash

set -euo pipefail

BRANCH="\${1:?Usage: $0 <branch-name>}"
COMMIT_MSG="\${2:?Usage: $0 <branch-name> <commit-message>}"

echo "=== Starting deployment ==="

git checkout main
git pull origin main

if git branch --list | grep -q "$BRANCH"; then
    git branch -D "$BRANCH"
fi

git checkout -b "$BRANCH"
echo "Created branch: $BRANCH"

echo "Some changes" >> changelog.txt
git add .
git commit -m "$COMMIT_MSG"
git push origin "$BRANCH"

echo "=== Creating PR ==="
gh pr create \
    --title "$COMMIT_MSG" \
    --body "Automated PR from deploy script" \
    --base main

echo "=== Done ==="
`, "bash");

add("Python CLI with Click", `import click


@click.group()
def cli():
    """Project management CLI tool."""


@cli.command()
@click.argument("name")
@click.option("--template", "-t", default="default",
              help="Project template to use")
@click.option("--git/--no-git", default=True,
              help="Initialize git repository")
def init(name, template, git):
    """Initialize a new project."""
    click.echo(f"Creating project: {name}")
    click.echo(f"Using template: {template}")
    if git:
        click.echo("Initializing git repository...")
    click.echo("Done!")


@cli.command()
@click.argument("path", type=click.Path(exists=True))
@click.option("--port", default=8000, help="Port to run on")
@click.option("--reload/--no-reload", default=True)
def serve(path, port, reload):
    """Serve a project locally."""
    click.echo(f"Serving {path} on port {port}")
    if reload:
        click.echo("Auto-reload enabled")


if __name__ == "__main__":
    cli()
`, "python");

add("Google Sheets API Integration", `const { google } = require("googleapis");

async function updateSpreadsheet(auth, spreadsheetId, range, values) {
  const sheets = google.sheets({ version: "v4", auth });

  const request = {
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    resource: { values },
  };

  const response = await sheets.spreadsheets.values.update(request);
  return response.data;
}

async function readSpreadsheet(auth, spreadsheetId, range) {
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values;
}

async function appendRow(auth, spreadsheetId, range, values) {
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: { values: [values] },
  });

  return response.data;
}

module.exports = { updateSpreadsheet, readSpreadsheet, appendRow };
`, "javascript");

add("Rust Actix Web Server", `use actix_web::{get, post, web, App, HttpServer, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
}

#[derive(Deserialize)]
struct CreateUserRequest {
    name: String,
    email: String,
}

#[get("/users")]
async fn get_users() -> impl Responder {
    let users = vec![
        User { id: 1, name: "Alice".into(), email: "alice@example.com".into() },
        User { id: 2, name: "Bob".into(), email: "bob@example.com".into() },
    ];
    HttpResponse::Ok().json(users)
}

#[post("/users")]
async fn create_user(body: web::Json<CreateUserRequest>) -> impl Responder {
    let user = User {
        id: 3,
        name: body.name.clone(),
        email: body.email.clone(),
    };
    HttpResponse::Created().json(user)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(get_users)
            .service(create_user)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
`, "rust");

add("Bash Docker Management", `#!/bin/bash

set -euo pipefail

CONTAINER_NAME="\${1:-myapp}"

echo "=== Docker Management ==="

if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running"
    exit 1
fi

echo "Building image..."
docker build -t "$CONTAINER_NAME:latest" .

echo "Stopping existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Starting container..."
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -v "$(pwd)/data:/app/data" \
    "$CONTAINER_NAME:latest"

echo "Container started successfully!"
docker ps --filter name="$CONTAINER_NAME"
`, "bash");

add("Python NumPy Examples", `import numpy as np

# Create arrays
arr = np.array([1, 2, 3, 4, 5])
zeros = np.zeros((3, 4))
ones = np.ones((2, 3))
identity = np.eye(4)
random_vals = np.random.randn(5, 5)

# Matrix operations
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

print("Matrix multiplication:")
print(A @ B)

print("\\nElement-wise:")
print(A * B)

# Statistics
data = np.random.randn(1000)
print(f"Mean: {data.mean():.4f}")
print(f"Std:  {data.std():.4f}")
print(f"Min:  {data.min():.4f}")
print(f"Max:  {data.max():.4f}")

# Broadcasting
x = np.array([1, 2, 3])
y = np.array([[10], [20], [30]])
print("\\nBroadcasted sum:")
print(x + y)
`, "python");

add("HTML Accessible Form", `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessible Form</title>
</head>
<body>
  <form aria-labelledby="form-title">
    <h1 id="form-title">Contact Us</h1>

    <div>
      <label for="name">Full Name</label>
      <input type="text" id="name" name="name" required aria-required="true" autocomplete="name">
    </div>

    <div>
      <label for="email">Email Address</label>
      <input type="email" id="email" name="email" required aria-required="true" autocomplete="email">
      <span id="email-hint" class="hint">We'll never share your email</span>
    </div>

    <div>
      <label for="message">Message</label>
      <textarea id="message" name="message" rows="5" aria-describedby="message-counter"></textarea>
      <span id="message-counter" aria-live="polite">0 characters</span>
    </div>

    <fieldset>
      <legend>Preferred contact method</legend>
      <div>
        <input type="radio" id="contact-email" name="contact" value="email" checked>
        <label for="contact-email">Email</label>
      </div>
      <div>
        <input type="radio" id="contact-phone" name="contact" value="phone">
        <label for="contact-phone">Phone</label>
      </div>
    </fieldset>

    <button type="submit" aria-label="Submit the contact form">Submit</button>
  </form>
</body>
</html>
`, "html");

add("SQL Performance Queries", `-- Find slow queries
SELECT
    query,
    calls,
    mean_exec_time,
    total_exec_time,
    rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Missing indexes
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / GREATEST(seq_scan, 1) AS avg_tuples_per_seq_scan
FROM pg_stat_user_tables
WHERE seq_scan > 1000
ORDER BY seq_scan DESC;

-- Index usage stats
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Table bloat estimate
SELECT
    schemaname,
    tablename,
    ROUND(
        (GREATEST(seq_scan, 1)::numeric / GREATEST(idx_scan, 1))
        , 2
    ) AS seq_vs_idx_ratio
FROM pg_stat_user_tables
HAVING seq_vs_idx_ratio > 10;
`, "sql");

add("JavaScript Promise Patterns", `// Promise with timeout
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

// Retry with exponential backoff
async function retry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Promise queue (concurrency limit)
async function promisePool(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const promise = task().then((result) => {
      executing.delete(promise);
      return result;
    });

    results.push(promise);
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}
`, "javascript");

add("React Native Component", `import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

type Props = {
  items: TodoItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoList({ items, onToggle, onDelete }: Props) {
  const renderItem = ({ item }: { item: TodoItem }) => (
    <View style={styles.item}>
      <TouchableOpacity onPress={() => onToggle(item.id)} style={styles.toggle}>
        <Text style={[styles.text, item.completed && styles.completed]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.delete}>
        <Text style={styles.deleteText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  toggle: { flex: 1 },
  text: { fontSize: 16 },
  completed: { textDecorationLine: "line-through", color: "#999" },
  delete: { padding: 8 },
  deleteText: { color: "red", fontWeight: "bold" },
});
`, "typescript");

add("Webpack Configuration", `const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [isProd ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
      ...(isProd ? [new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" })] : []),
    ],
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
    },
    devtool: isProd ? "source-map" : "eval-source-map",
  };
};
`, "javascript");

add("SQL Data Migration Example", `-- Migration: add user roles
-- Date: 2025-01-15

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO user_roles (name) VALUES
    ('admin'),
    ('moderator'),
    ('user'),
    ('viewer')
ON CONFLICT (name) DO NOTHING;

-- Migrate existing data
UPDATE users SET role = 'admin' WHERE email LIKE '%@company.com';
UPDATE users SET role = 'viewer' WHERE status = 'inactive';

-- Add constraint after data is clean
ALTER TABLE users ADD CONSTRAINT fk_user_role
    FOREIGN KEY (role) REFERENCES user_roles(name);

CREATE INDEX idx_users_role ON users(role);

COMMIT;
`, "sql");

// Generate pastes programmatically from templates, filling up to 100+
const generatedPastes: typeof PASTE_TEMPLATES = [];

const VARIATIONS: { titlePrefix: string; content: string; language: string }[] = [
  { titlePrefix: "Hello World in ", content: "print(\"Hello, World!\")", language: "python" },
  { titlePrefix: "Hello World in ", content: "console.log(\"Hello, World!\");", language: "javascript" },
  { titlePrefix: "Hello World in ", content: "fmt.Println(\"Hello, World!\")", language: "go" },
  { titlePrefix: "Hello World in ", content: "println!(\"Hello, World!\");", language: "rust" },
  { titlePrefix: "Hello World in ", content: "printf(\"Hello, World!\\n\");", language: "cpp" },
  { titlePrefix: "Hello World in ", content: "System.out.println(\"Hello, World!\");", language: "java" },
  { titlePrefix: "Hello World in ", content: "echo \"Hello, World!\";", language: "php" },
  { titlePrefix: "Hello World in ", content: "puts \"Hello, World!\"", language: "ruby" },
  { titlePrefix: "Hello World in ", content: "print(\"Hello, World!\")", language: "swift" },
  { titlePrefix: "Hello World in ", content: "print(\"Hello, World!\")", language: "kotlin" },
  { titlePrefix: "FizzBuzz in ", content: `for i in range(1, 101):\n    fizz = "Fizz" if i % 3 == 0 else ""\n    buzz = "Buzz" if i % 5 == 0 else ""\n    print(f"{fizz}{buzz}" or i)`, language: "python" },
  { titlePrefix: "FizzBuzz in ", content: `for (let i = 1; i <= 100; i++) {\n  let out = "";\n  if (i % 3 === 0) out += "Fizz";\n  if (i % 5 === 0) out += "Buzz";\n  console.log(out || i);\n}`, language: "javascript" },
  { titlePrefix: "FizzBuzz in ", content: `for i := 1; i <= 100; i++ {\n    out := ""\n    if i%3 == 0 { out += "Fizz" }\n    if i%5 == 0 { out += "Buzz" }\n    if out == "" { out = strconv.Itoa(i) }\n    fmt.Println(out)\n}`, language: "go" },
  { titlePrefix: "FizzBuzz in ", content: `fn main() {\n    for i in 1..=100 {\n        match (i % 3, i % 5) {\n            (0, 0) => println!("FizzBuzz"),\n            (0, _) => println!("Fizz"),\n            (_, 0) => println!("Buzz"),\n            _ => println!("{}", i),\n        }\n    }\n}`, language: "rust" },
  { titlePrefix: "Fibonacci in ", content: `def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(list(fib(20)))`, language: "python" },
  { titlePrefix: "Fibonacci in ", content: `function* fib(n) {\n  let a = 0, b = 1;\n  for (let i = 0; i < n; i++) {\n    yield a;\n    [a, b] = [b, a + b];\n  }\n}\nconsole.log([...fib(20)]);`, language: "javascript" },
  { titlePrefix: "Palindrome Check in ", content: `function isPalindrome(s: string): boolean {\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return cleaned === cleaned.split("").reverse().join("");\n}`, language: "typescript" },
  { titlePrefix: "Palindrome Check in ", content: `def is_palindrome(s: str) -> bool:\n    cleaned = re.sub(r'[^a-z0-9]', '', s.lower())\n    return cleaned == cleaned[::-1]`, language: "python" },
  { titlePrefix: "Array Reverse in ", content: `function reverse<T>(arr: T[]): T[] {\n  const result: T[] = [];\n  for (let i = arr.length - 1; i >= 0; i--) {\n    result.push(arr[i]);\n  }\n  return result;\n}`, language: "typescript" },
  { titlePrefix: "Array Reverse in ", content: `func reverse[T any](arr []T) []T {\n    result := make([]T, len(arr))\n    for i, v := range arr {\n        result[len(arr)-1-i] = v\n    }\n    return result\n}`, language: "go" },
  { titlePrefix: "Map/Filter in ", content: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\nconst doubled = numbers.map(n => n * 2);\nconst evens = numbers.filter(n => n % 2 === 0);\nconst sum = numbers.reduce((a, b) => a + b, 0);`, language: "javascript" },
  { titlePrefix: "Map/Filter in ", content: `numbers = list(range(1, 11))\ndoubled = list(map(lambda x: x * 2, numbers))\nevens = list(filter(lambda x: x % 2 == 0, numbers))\nsum_all = sum(numbers)`, language: "python" },
  { titlePrefix: "Sleep Sort in ", content: `import asyncio\n\nasync def sleep_sort(nums):\n    async def task(n):\n        await asyncio.sleep(n * 0.01)\n        print(n)\n    await asyncio.gather(*(task(n) for n in nums))\n\nasyncio.run(sleep_sort([3, 1, 4, 1, 5, 9, 2, 6]))`, language: "python" },
  { titlePrefix: "Curry Function in ", content: `function curry(fn: Function): Function {\n  return function curried(...args: any[]) {\n    if (args.length >= fn.length) {\n      return fn(...args);\n    }\n    return (...more: any[]) => curried(...args, ...more);\n  };\n}\n\nconst add = (a: number, b: number, c: number) => a + b + c;\nconst curriedAdd = curry(add);\nconsole.log(curriedAdd(1)(2)(3)); // 6`, language: "typescript" },
  { titlePrefix: "Deep Clone in ", content: `function deepClone<T>(obj: T, seen = new WeakMap()): T {\n  if (obj === null || typeof obj !== "object") return obj;\n  if (seen.has(obj)) return seen.get(obj);\n  const clone = Array.isArray(obj) ? [] : {};\n  seen.set(obj, clone);\n  for (const key in obj) {\n    if (Object.prototype.hasOwnProperty.call(obj, key)) {\n      clone[key] = deepClone(obj[key], seen);\n    }\n  }\n  return clone as T;\n}`, language: "typescript" },
  { titlePrefix: "Flatten Array in ", content: `function flatten<T>(arr: any[]): T[] {\n  return arr.reduce<T[]>((acc, val) =>\n    Array.isArray(val) ? [...acc, ...flatten(val)] : [...acc, val]\n  , []);\n}\n\nconsole.log(flatten([1, [2, [3, [4, [5]]]]]));`, language: "typescript" },
  { titlePrefix: ".env Example for ", content: `# Application\nNODE_ENV=development\nPORT=3000\nHOST=localhost\n\n# Database\nDATABASE_URL=postgresql://user:password@localhost:5432/mydb\nDB_POOL_MIN=2\nDB_POOL_MAX=10\n\n# Auth\nJWT_SECRET=your-secret-key-here\nJWT_EXPIRES_IN=7d\n\n# Redis\nREDIS_URL=redis://localhost:6379\n\n# External APIs\nAPI_KEY=your-api-key\nAPI_ENDPOINT=https://api.example.com/v1`, language: "bash" },
  { titlePrefix: "Dockerignore for ", content: `node_modules\nnpm-debug.log\n.git\n.gitignore\n.env\n.env.local\n.env.*.local\n*.md\ndist\nbuild\n.next\ncoverage\n.vscode\n.idea\n*.swp\n*.swo\n*~\n.DS_Store\nThumbs.db`, language: "bash" },
  { titlePrefix: "Gitignore for ", content: `# Dependencies\nnode_modules/\n.pnp\n.pnp.js\n\n# Build\ndist/\nbuild/\n.next/\nout/\n\n# Environment\n.env\n.env.local\n.env.*.local\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n*~\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nnpm-debug.log*\n\n# Testing\ncoverage/\n`, language: "bash" },
  { titlePrefix: "Prime Sieve in ", content: `def sieve(n: int) -> list[int]:\n    is_prime = [True] * (n + 1)\n    is_prime[0] = is_prime[1] = False\n    for i in range(2, int(n**0.5) + 1):\n        if is_prime[i]:\n            for j in range(i * i, n + 1, i):\n                is_prime[j] = False\n    return [i for i, p in enumerate(is_prime) if p]\n\nprint(sieve(100))`, language: "python" },
  { titlePrefix: "Prime Sieve in ", content: `function sieve(n: number): number[] {\n  const isPrime = new Array(n + 1).fill(true);\n  isPrime[0] = isPrime[1] = false;\n  for (let i = 2; i * i <= n; i++) {\n    if (isPrime[i]) {\n      for (let j = i * i; j <= n; j += i) {\n        isPrime[j] = false;\n      }\n    }\n  }\n  return isPrime.map((v, i) => v ? i : -1).filter(v => v !== -1);\n}\n\nconsole.log(sieve(100));`, language: "typescript" },
  { titlePrefix: "Anagram Check in ", content: `function isAnagram(s1: string, s2: string): boolean {\n  const normalize = (s: string) =>\n    s.toLowerCase().split("").sort().join("");\n  return normalize(s1) === normalize(s2);\n}`, language: "typescript" },
  { titlePrefix: "Anagram Check in ", content: `def is_anagram(s1: str, s2: str) -> bool:\n    return sorted(s1.lower()) == sorted(s2.lower())`, language: "python" },
  { titlePrefix: "Memoization in ", content: `function memoize<T extends (...args: any[]) => any>(fn: T): T {\n  const cache = new Map<string, ReturnType<T>>();\n  return ((...args: any[]) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  }) as T;\n}`, language: "typescript" },
  { titlePrefix: "Factorial in ", content: `def factorial(n: int) -> int:\n    if n <= 1: return 1\n    return n * factorial(n - 1)\n\nprint(factorial(10))`, language: "python" },
  { titlePrefix: "Factorial in ", content: `function factorial(n: number): number {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}`, language: "typescript" },
  { titlePrefix: "Unique Values in ", content: `function unique<T>(arr: T[]): T[] {\n  return [...new Set(arr)];\n}`, language: "typescript" },
  { titlePrefix: "Group By in ", content: `function groupBy<T, K extends string | number | symbol>(\n  arr: T[],\n  keyFn: (item: T) => K\n): Record<K, T[]> {\n  return arr.reduce((acc, item) => {\n    const key = keyFn(item);\n    (acc[key] ??= []).push(item);\n    return acc;\n  }, {} as Record<K, T[]>);\n}`, language: "typescript" },
  { titlePrefix: "Zod Enum Parser in ", content: `const Environment = z.enum(["development", "staging", "production"]);\ntype Environment = z.infer<typeof Environment>;\n\nconst ConfigSchema = z.object({\n  port: z.coerce.number().int().positive(),\n  env: Environment,\n  database: z.object({\n    url: z.string().url(),\n    pool: z.object({\n      min: z.number().int().min(1),\n      max: z.number().int().max(100),\n    }),\n  }),\n  features: z.record(z.boolean()),\n});`, language: "typescript" },
  { titlePrefix: "Rate Limiter in ", content: `export class RateLimiter {\n  private requests = new Map<string, number[]>();\n\n  constructor(private limit: number, private windowMs: number) {}\n\n  check(key: string): boolean {\n    const now = Date.now();\n    const timestamps = this.requests.get(key) ?? [];\n    const recent = timestamps.filter(t => now - t < this.windowMs);\n    if (recent.length >= this.limit) return false;\n    recent.push(now);\n    this.requests.set(key, recent);\n    return true;\n  }\n}`, language: "typescript" },
  { titlePrefix: "Event Emitter in ", content: `type Handler = (...args: any[]) => void;\n\nexport class EventEmitter {\n  private events = new Map<string, Set<Handler>>();\n\n  on(event: string, handler: Handler): void {\n    if (!this.events.has(event)) {\n      this.events.set(event, new Set());\n    }\n    this.events.get(event)!.add(handler);\n  }\n\n  emit(event: string, ...args: any[]): void {\n    this.events.get(event)?.forEach(h => h(...args));\n  }\n\n  off(event: string, handler: Handler): void {\n    this.events.get(event)?.delete(handler);\n  }\n}`, language: "typescript" },
  { titlePrefix: "LRU Cache in ", content: `class LRUCache<K, V> {\n  private capacity: number;\n  private cache = new Map<K, V>();\n\n  constructor(capacity: number) {\n    this.capacity = capacity;\n  }\n\n  get(key: K): V | undefined {\n    if (!this.cache.has(key)) return undefined;\n    const value = this.cache.get(key)!;\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n\n  put(key: K, value: V): void {\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    } else if (this.cache.size >= this.capacity) {\n      const firstKey = this.cache.keys().next().value;\n      if (firstKey !== undefined) this.cache.delete(firstKey);\n    }\n    this.cache.set(key, value);\n  }\n}`, language: "typescript" },
  { titlePrefix: "CSV Parser in ", content: `function parseCSV(text: string): Record<string, string>[] {\n  const [headerLine, ...lines] = text.trim().split("\\n");\n  const headers = headerLine.split(",").map(h => h.trim());\n  return lines.map(line => {\n    const values = line.split(",").map(v => v.trim());\n    return Object.fromEntries(\n      headers.map((h, i) => [h, values[i] ?? ""])\n    );\n  });\n}\n\nconst csv = \`name,age,city\nAlice,30,NYC\nBob,25,SF\`;\nconsole.log(parseCSV(csv));`, language: "typescript" },
  { titlePrefix: "Pub/Sub Pattern in ", content: `type Listener = (data: any) => void;\n\nexport class PubSub {\n  private channels = new Map<string, Set<Listener>>();\n\n  subscribe(channel: string, listener: Listener): () => void {\n    if (!this.channels.has(channel)) {\n      this.channels.set(channel, new Set());\n    }\n    this.channels.get(channel)!.add(listener);\n    return () => this.channels.get(channel)?.delete(listener);\n  }\n\n  publish(channel: string, data: any): void {\n    this.channels.get(channel)?.forEach(l => l(data));\n  }\n}`, language: "typescript" },
  { titlePrefix: "Simple State Machine in ", content: `class StateMachine<S extends string, E extends string> {\n  private current: S;\n  private transitions = new Map<string, S>();\n\n  constructor(initial: S) {\n    this.current = initial;\n  }\n\n  addTransition(from: S, event: E, to: S): void {\n    this.transitions.set(\`\${from}:\${event}\`, to);\n  }\n\n  dispatch(event: E): boolean {\n    const key = \`\${this.current}:\${event}\`;\n    const next = this.transitions.get(key);\n    if (!next) return false;\n    this.current = next;\n    return true;\n  }\n\n  get state(): S { return this.current; }\n}`, language: "typescript" },
  { titlePrefix: "API Client in ", content: `class APIClient {\n  private baseURL: string;\n  private headers: Record<string, string>;\n\n  constructor(baseURL: string, token?: string) {\n    this.baseURL = baseURL;\n    this.headers = {\n      "Content-Type": "application/json",\n      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),\n    };\n  }\n\n  async get<T>(path: string): Promise<T> {\n    const res = await fetch(\`\${this.baseURL}\${path}\`, { headers: this.headers });\n    if (!res.ok) throw new Error(\`GET \${path} failed: \${res.status}\`);\n    return res.json();\n  }\n\n  async post<T>(path: string, body: unknown): Promise<T> {\n    const res = await fetch(\`\${this.baseURL}\${path}\`, {\n      method: "POST",\n      headers: this.headers,\n      body: JSON.stringify(body),\n    });\n    if (!res.ok) throw new Error(\`POST \${path} failed: \${res.status}\`);\n    return res.json();\n  }\n}`, language: "typescript" },
  { titlePrefix: "Semaphore in ", content: `class Semaphore {\n  private current: number;\n  private queue: (() => void)[] = [];\n\n  constructor(private max: number) {\n    this.current = max;\n  }\n\n  async acquire(): Promise<void> {\n    if (this.current > 0) {\n      this.current--;\n      return;\n    }\n    return new Promise(resolve => this.queue.push(resolve));\n  }\n\n  release(): void {\n    const next = this.queue.shift();\n    if (next) {\n      next();\n    } else {\n      this.current++;\n    }\n  }\n\n  async run<T>(fn: () => Promise<T>): Promise<T> {\n    await this.acquire();\n    try {\n      return await fn();\n    } finally {\n      this.release();\n    }\n  }\n}`, language: "typescript" },
  { titlePrefix: "Task Queue in ", content: `type Task<T> = () => Promise<T>;\n\nclass TaskQueue {\n  private queue: Task<unknown>[] = [];\n  private running = 0;\n\n  constructor(private concurrency: number) {}\n\n  add<T>(task: Task<T>): Promise<T> {\n    return new Promise((resolve, reject) => {\n      this.queue.push(async () => {\n        try {\n          resolve(await task());\n        } catch (e) {\n          reject(e);\n        }\n      });\n      this.process();\n    });\n  }\n\n  private process(): void {\n    while (this.running < this.concurrency && this.queue.length > 0) {\n      const task = this.queue.shift()!;\n      this.running++;\n      task().finally(() => {\n        this.running--;\n        this.process();\n      });\n    }\n  }\n}`, language: "typescript" },
  { titlePrefix: "Observable Pattern in ", content: `class Observable<T> {\n  private observers: Set<(value: T) => void> = new Set();\n\n  subscribe(fn: (value: T) => void): () => void {\n    this.observers.add(fn);\n    return () => this.observers.delete(fn);\n  }\n\n  next(value: T): void {\n    this.observers.forEach(fn => fn(value));\n  }\n\n  pipe<R>(transform: (value: T) => R): Observable<R> {\n    const result = new Observable<R>();\n    this.subscribe(v => result.next(transform(v)));\n    return result;\n  }\n}`, language: "typescript" },
  { titlePrefix: "Throttle in ", content: `function throttle<T extends (...args: any[]) => void>(\n  fn: T,\n  delay: number\n): (...args: Parameters<T>) => void {\n  let lastCall = 0;\n  return (...args: Parameters<T>) => {\n    const now = Date.now();\n    if (now - lastCall >= delay) {\n      lastCall = now;\n      fn(...args);\n    }\n  };\n}`, language: "typescript" },
];

for (const v of VARIATIONS) {
  const languages = ["python", "javascript", "typescript", "go", "rust", "java", "cpp", "ruby", "bash", "php", "swift", "kotlin"];
  const targets = languages.filter(l => l !== v.language).slice(0, 3);
  for (const lang of targets) {
    generatedPastes.push({
      title: `${v.titlePrefix}${lang.charAt(0).toUpperCase() + lang.slice(1)}`,
      content: `// ${v.titlePrefix}${lang}\n// Implement the equivalent in ${lang}\n\n${v.content}`,
      language: lang,
    });
  }
}

const ALL_TEMPLATES = [...PASTE_TEMPLATES, ...generatedPastes];

const COMMENT_TEMPLATES = [
  "Great snippet, thanks for sharing!",
  "This is really clean. I like the approach.",
  "Have you considered handling edge cases like empty input?",
  "Nice work! I've been looking for something like this.",
  "I'd refactor this to make it more readable, but the logic is solid.",
  "Would be better with some error handling added.",
  "Perfect, just what I needed for my project.",
  "Could you add comments explaining the algorithm?",
  "I've used this in production and it works well.",
  "There's a minor bug when the input is null.",
  "This helped me understand the concept better, thanks!",
  "Clean code! Following SOLID principles I see.",
  "You should add unit tests for this.",
  "Nice pattern. I'll adopt this in my codebase.",
  "Simple and effective. No unnecessary complexity.",
  "This is good but could use some optimization for large inputs.",
  "Bookmarked! Very useful reference.",
  "I wrote something similar but yours is cleaner.",
  "Thanks for posting this. Really helpful.",
  "The type safety here is excellent.",
];

const LANGUAGE_NAMES: Record<string, string> = {
  typescript: "TypeScript", javascript: "JavaScript", python: "Python",
  rust: "Rust", go: "Go", bash: "Bash", sql: "SQL", yaml: "YAML",
  css: "CSS", html: "HTML", json: "JSON", dockerfile: "Dockerfile",
  java: "Java", cpp: "C++", ruby: "Ruby", php: "PHP", swift: "Swift",
  kotlin: "Kotlin", scala: "Scala", lua: "Lua",
};

const NAMES = [
  "Alice Johnson", "Bob Chen", "Charlie Rivera", "Diana Park",
  "Eve Martinez", "Frank Lee", "Grace Kim", "Henry Wilson",
  "Ivy Patel", "Jack Brown", "Kara Smith", "Leo Davis",
  "Mia Garcia", "Noah Miller", "Olivia Taylor", "Paul Anderson",
  "Quinn Thomas", "Rosa Jackson", "Sam White", "Tina Harris",
];

const BIOS = [
  "Full-stack developer sharing useful snippets.",
  "Backend engineer who loves clean code.",
  "Frontend enthusiast documenting patterns I use daily.",
  "DevOps engineer sharing configs and scripts.",
  "Open source contributor and lifelong learner.",
  "Software architect sharing design patterns.",
  "Data engineer posting ETL and pipeline snippets.",
  "Mobile developer sharing cross-platform solutions.",
  "Security researcher sharing CTF writeups and tools.",
  "Student learning and sharing my journey.",
  "Senior developer mentoring through code examples.",
  "Tech lead sharing battle-tested patterns.",
  "Hobbyist coder who enjoys solving puzzles.",
  "System programmer sharing low-level code.",
  "Cloud architect posting infrastructure snippets.",
  "AI/ML engineer sharing model code and utilities.",
  "Game developer sharing graphics and physics code.",
  "Competitive programmer sharing algorithm solutions.",
  "Database administrator sharing optimization tricks.",
  "Site reliability engineer sharing monitoring configs.",
];

async function main() {
  console.log("Seeding database with 100+ pastes...");

  const password = await hash("password123", SALT_ROUNDS);

  const userRecords = [];
  for (let i = 0; i < NAMES.length; i++) {
    const email = `${NAMES[i].split(" ")[0].toLowerCase()}${i}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: NAMES[i],
        image: null,
        bio: BIOS[i],
        hashedPassword: password,
      },
    });
    userRecords.push(user);
  }
  console.log(`Created ${userRecords.length} users`);

  const now = Date.now();
  const hoursAgo = (i: number) => new Date(now - i * 3600000);

  const pastes: {
    prismaPaste: Parameters<typeof prisma.paste.create>[0]["data"];
    templateIndex: number;
  }[] = [];

  const totalDesired = 120;
  const templates = ALL_TEMPLATES;

  for (let i = 0; i < totalDesired; i++) {
    const template = templates[i % templates.length];
    const user = userRecords[i % userRecords.length];
    const lang = template.language;
    const langName = LANGUAGE_NAMES[lang] ?? lang;

    const title = i < templates.length
      ? template.title
      : `${langName} Snippet #${Math.floor(i / templates.length) + 1}: ${template.title}`;

    pastes.push({
      prismaPaste: {
        id: nanoid(10),
        title,
        content: template.content,
        language: lang,
        isPublic: true,
        authorId: user.id,
        createdAt: hoursAgo(totalDesired - i),
      },
      templateIndex: i,
    });
  }

  for (const { prismaPaste } of pastes) {
    await prisma.paste.create({ data: prismaPaste });
  }
  console.log(`Created ${pastes.length} public pastes`);

  const comments: {
    content: string;
    pasteId: string;
    authorId: string;
    createdAt: Date;
  }[] = [];

  const pasteRecords = pastes.slice(0, 60);

  for (let i = 0; i < pasteRecords.length; i++) {
    const numComments = (i % 3) + 1;
    for (let j = 0; j < numComments; j++) {
      const authorIdx = (i + j + 1) % userRecords.length;
      comments.push({
        content: COMMENT_TEMPLATES[(i * numComments + j) % COMMENT_TEMPLATES.length],
        pasteId: pasteRecords[i].prismaPaste.id,
        authorId: userRecords[authorIdx].id,
        createdAt: new Date(now - (pastes.length - i) * 3600000 + j * 60000),
      });
    }
  }

  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
  }
  console.log(`Created ${comments.length} comments`);

  console.log("\nSeed complete!");
  console.log(`  ${userRecords.length} users`);
  console.log(`  ${pastes.length} public pastes`);
  console.log(`  ${comments.length} comments`);
  console.log("\nLogin for any user: password123");
  console.log(`Emails: ${userRecords.slice(0, 4).map(u => u.email).join(", ")} ...and more`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
