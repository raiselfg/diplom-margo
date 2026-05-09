import { EventStatus } from './generated/prisma/client';

export const categories = [
  { name: 'Мебель' },
  { name: 'Техника' },
  { name: 'Декор' },
  { name: 'Аксессуары' },
];

export const items = [
  {
    name: 'Стул белый (White Chair)',
    categoryName: 'Мебель',
    totalQuantity: 50,
    description: 'Классический белый стул для свадеб и банкетов',
  },
  {
    name: 'Sony A7 IV',
    categoryName: 'Техника',
    totalQuantity: 3,
    description: 'Полнокадровая беззеркальная камера',
  },
  {
    name: 'Проектор Epson EB-L520U',
    categoryName: 'Техника',
    totalQuantity: 2,
    description: 'Лазерный проектор для презентаций',
  },
  {
    name: 'Скатерть атласная (Satin Tablecloth)',
    categoryName: 'Декор',
    totalQuantity: 20,
    description: 'Белая атласная скатерть 1.5x1.5м',
  },
  {
    name: 'Manfrotto Tripod',
    categoryName: 'Аксессуары',
    totalQuantity: 5,
    description: 'Профессиональный штатив',
  },
];

export const events = [
  {
    title: 'Свадьба Ивана и Марии',
    startDate: new Date('2026-06-15T10:00:00Z'),
    endDate: new Date('2026-06-17T22:00:00Z'),
    status: EventStatus.CONFIRMED,
  },
  {
    title: 'Корпоратив TechCorp',
    startDate: new Date('2026-06-15T09:00:00Z'),
    endDate: new Date('2026-06-17T17:00:00Z'),
    status: EventStatus.CONFIRMED,
  },
  {
    title: 'Конференция "Будущее IT"',
    startDate: new Date('2026-05-01T09:00:00Z'),
    endDate: new Date('2026-05-02T18:00:00Z'),
    status: EventStatus.FINISHED,
  },
  {
    title: 'Фотосессия в студии',
    startDate: new Date('2026-07-10T12:00:00Z'),
    endDate: new Date('2026-07-10T18:00:00Z'),
    status: EventStatus.CONFIRMED,
  },
];
