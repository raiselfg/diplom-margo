import Image from 'next/image';

interface Product {
  id: number;
  img: string;
  name: string;
  quantity: number;
}

const inventory: Product[] = [
  {
    id: 1,
    img: 'https://storage.yandexcloud.net/s.stroyudacha.ru/products/2023/10/190758/1.jpg',
    name: 'Зеркальный шар (50 см) с электроприводом',
    quantity: 4,
  },
  {
    id: 2,
    img: 'https://storage.yandexcloud.net/s.stroyudacha.ru/products/2023/10/190758/1.jpg',
    name: 'Генератор тяжелого дыма 3000W',
    quantity: 2,
  },
  {
    id: 3,
    img: 'https://storage.yandexcloud.net/s.stroyudacha.ru/products/2023/10/190758/1.jpg',
    name: 'Стол коктейльный высокий (белый)',
    quantity: 15,
  },
  {
    id: 4,
    img: 'https://storage.yandexcloud.net/s.stroyudacha.ru/products/2023/10/190758/1.jpg',
    name: "Неоновая вывеска 'Let's Party' (тепло-белая)",
    quantity: 3,
  },
  {
    id: 5,
    img: 'https://storage.yandexcloud.net/s.stroyudacha.ru/products/2023/10/190758/1.jpg',
    name: 'Шоколадный фонтан (5 ярусов, 80 см)',
    quantity: 2,
  },
  {
    id: 6,
    img: 'https://storage.yandexcloud.net/s.stroyudacha.ru/products/2023/10/190758/1.jpg',
    name: 'Ковровая дорожка (красная, 10 метров)',
    quantity: 5,
  },
  {
    id: 7,
    img: 'https://storage.yandexcloud.net/s.stroyudacha.ru/products/2023/10/190758/1.jpg',
    name: 'Прожектор светодиодный LED PAR 18x12W',
    quantity: 24,
  },
  {
    id: 8,
    img: 'https://storage.yandexcloud.net/s.stroyudacha.ru/products/2023/10/190758/1.jpg',
    name: "Стул складной 'Кьявари' (белый поликарбонат)",
    quantity: 120,
  },
];

export default function Inventory() {
  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Инвентарь
          </h1>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            Всего позиций: {inventory.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl"
            >
              {/* Контейнер для изображения */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Контент карточки */}
              <div className="flex grow flex-col p-4">
                <h3 className="mb-3 line-clamp-2 min-h-10 text-sm font-semibold text-gray-800">
                  {item.name}
                </h3>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs tracking-wider text-gray-500 uppercase">
                      В наличии
                    </span>
                    <span
                      className={`text-lg font-bold ${item.quantity < 5 ? 'text-orange-500' : 'text-emerald-600'}`}
                    >
                      {item.quantity} шт.
                    </span>
                  </div>

                  <button className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
