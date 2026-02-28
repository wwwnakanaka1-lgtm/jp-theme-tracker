export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">JP Theme Tracker について</h1>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <h2 className="text-lg font-semibold text-white">概要</h2>
        <p className="text-gray-300 leading-relaxed">
          JP Theme Tracker は、日本株をテーマ別に分類し、各テーマの騰落率をリアルタイムで追跡する
          分析ツールです。AI、半導体、EV など 20 の投資テーマごとに 10 銘柄を選定し、
          テーマ全体のパフォーマンスを可視化します。
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <h2 className="text-lg font-semibold text-white">主な機能</h2>
        <ul className="space-y-2 text-gray-300">
          <li>- テーマ別騰落率ランキング（1日〜5年）</li>
          <li>- ヒートマップ表示（時価総額別 / セクター別）</li>
          <li>- 個別銘柄詳細（テクニカル指標、チャート）</li>
          <li>- 5分ごとの自動データ更新</li>
          <li>- PWA対応（オフライン利用可能）</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <h2 className="text-lg font-semibold text-white">技術スタック</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="text-blue-400 font-medium mb-2">Frontend</h3>
            <ul className="text-gray-400 space-y-1">
              <li>Next.js 14 (App Router)</li>
              <li>React + TypeScript</li>
              <li>Tailwind CSS</li>
              <li>SWR / Recharts</li>
            </ul>
          </div>
          <div>
            <h3 className="text-green-400 font-medium mb-2">Backend</h3>
            <ul className="text-gray-400 space-y-1">
              <li>FastAPI + Pydantic</li>
              <li>yfinance</li>
              <li>pandas / numpy / scipy</li>
              <li>APScheduler</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-2">データソース</h2>
        <p className="text-gray-400 text-sm">
          株価データは Yahoo Finance (yfinance) から取得しています。
          データは参考情報であり、投資判断の最終的な責任はご自身にあります。
        </p>
      </div>
    </div>
  );
}
