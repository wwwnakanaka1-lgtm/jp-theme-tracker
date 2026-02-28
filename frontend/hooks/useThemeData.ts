import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useThemeData(period: string = '1d') {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { data, error, isLoading } = useSWR(
    `${apiBase}/api/themes?period=${period}`,
    fetcher,
    { refreshInterval: 300000 },
  );

  return {
    themes: data?.themes || [],
    market: data?.market || null,
    isLoading,
    isError: !!error,
  };
}

export function useStockData(code: string, period: string = '1y') {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { data, error, isLoading } = useSWR(
    code ? `${apiBase}/api/stocks/${code}?period=${period}` : null,
    fetcher,
  );

  return {
    stock: data,
    isLoading,
    isError: !!error,
  };
}
