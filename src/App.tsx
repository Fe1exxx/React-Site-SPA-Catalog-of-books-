import { useState, useEffect, useMemo } from 'react';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

async function api(url: string): Promise<Post[]> {
  try {
    const response = await fetch(url.trim());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

type ViewMode = 'all' | 'first-half' | 'second-half';

export default function App() {
  const [book, setBook] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorite, setFavorite] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    async function loadBook() {
      try {
        const data = await api('https://jsonplaceholder.typicode.com/posts');
        setBook(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load book');
        }
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, []);

  const booksByMode = useMemo(() => {
    if (!book) return [];
    switch (viewMode) {
      case 'first-half':  return book.filter(p => p.userId <= 5);
      case 'second-half': return book.filter(p => p.userId >= 6);
      default:            return book;
    }
  }, [book, viewMode]);

  const displayedBooks = useMemo(() => {
    if (!search.trim()) return booksByMode;
    const term = search.toLowerCase();
    return booksByMode.filter(post =>
      post.title.toLowerCase().includes(term)
    );
  }, [booksByMode, search]);

  const sortedFavorite = useMemo(
    () => [...favorite].sort((a, b) => a - b),
    [favorite]
  );

  if (loading) return <div className="ml-5 mt-5">Loading...</div>;
  if (error) return <div className="ml-5 mt-5">Error: {error}</div>;
  if (!book) return <div className="ml-5 mt-5">No data</div>;

  return (
    <div className="ml-5 mt-5">
      <p className="float-right mr-20">
        ⭐ В избранном: {sortedFavorite.length ? sortedFavorite.join(', ') : '—'}
      </p>

      <div className="mb-4">
        <button
          className="border p-2 m-1 cursor-pointer hover:bg-gray-200"
          onClick={() => setViewMode('all')}
        >
          Все
        </button>
        <button
          className="border p-2 m-1 cursor-pointer hover:bg-gray-200"
          onClick={() => setViewMode('first-half')}
        >
          Тома 1–5
        </button>
        <button
          className="border p-2 m-1 cursor-pointer hover:bg-gray-200"
          onClick={() => setViewMode('second-half')}
        >
          Тома 6–10
        </button>
      </div>

      <input
        type="text"
        placeholder="Поиск по названию..."
        className="border p-2 mb-4 w-64"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {displayedBooks.length === 0 ? (
          <li>Ничего не найдено</li>
        ) : (
          displayedBooks.map((el) => (
            <li key={el.id} className="mb-2 flex items-center">
              <strong>#{el.id}</strong>: {el.title}
              <button
                className="cursor-pointer ml-2 text-yellow-500"
                onClick={() => {
                  if (!favorite.includes(el.id)) {
                    setFavorite((prev) => [...prev, el.id]);
                  }
                }}
              >
                ⭐
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}