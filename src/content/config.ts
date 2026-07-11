import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    icon: z.string(),
    excerpt: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    image: z.string(),
    year: z.number(),
    order: z.number().default(0),
  }),
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    quote: z.string(),
    avatar: z.string().optional(),
    rating: z.number().min(1).max(5).default(5),
  }),
});

const plans = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    price: z.string(),
    period: z.enum(['month', 'year', 'one-time', 'custom']),
    features: z.array(z.string()),
    highlighted: z.boolean().default(false),
  }),
});

export const collections = { services, projects, testimonials, plans };
