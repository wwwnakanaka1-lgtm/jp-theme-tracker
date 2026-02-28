// req:REQ-007
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Info, Smartphone, HelpCircle, BarChart2, FileText, TrendingUp, Grid3X3 } from 'lucide-react';

type MenuSection = 'about' | 'pwa' | 'qa' | 'analysis' | 'marketcap' | 'disclaimer' | null;

export default function SlideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>(null);

  const menuItems = [
    { id: 'about' as const, icon: Info, label: 'このアプリについて' },
    { id: 'pwa' as const, icon: Smartphone, label: 'ホーム画面に追加' },
    { id: 'qa' as const, icon: HelpCircle, label: 'Q&A' },
    { id: 'analysis' as const, icon: BarChart2, label: '騰落率分析について' },
    { id: 'marketcap' as const, icon: TrendingUp, label: '時価総額分類について' },
    { id: 'disclaimer' as const, icon: FileText, label: '免責事項・知的財産権' },
  ];

  const linkItems = [
    { href: '/heatmap', icon: Grid3X3, label: '時価総額ヒートマップ' },
  ];

  const handleMenuClick = (section: MenuSection) => {
    setActiveSection(section);
  };

  const handleBack = () => {
    setActiveSection(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveSection(null);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        aria-label="メニューを開く"
      >
        <Menu className="w-5 h-5 text-gray-300" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClose}
        />
      )}

      {/* Slide Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">
            {activeSection ? menuItems.find(m => m.id === activeSection)?.label : 'メニュー'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {activeSection === null ? (
            /* Menu List */
            <nav className="p-2">
              {/* ページリンク */}
              {linkItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleClose}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-200">{item.label}</span>
                </Link>
              ))}

              {/* 区切り線 */}
              <div className="my-2 border-t border-gray-800" />

              {/* 情報セクション */}
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  <item.icon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-200">{item.label}</span>
                </button>
              ))}
            </nav>
          ) : (
            /* Content Section */
            <div className="p-4">
              <button
                onClick={handleBack}
                className="mb-4 text-sm text-blue-400 hover:text-blue-300"
              >
                ← 戻る
              </button>
              <MenuContent section={activeSection} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MenuContent({ section }: { section: MenuSection }) {
  switch (section) {
    case 'about':
      return <AboutContent />;
    case 'pwa':
      return <PWAContent />;
    case 'qa':
      return <QAContent />;
    case 'analysis':
      return <AnalysisContent />;
    case 'marketcap':
      return <MarketCapContent />;
    case 'disclaimer':
      return <DisclaimerContent />;
    default:
      return null;
  }
}

function AboutContent() {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <h3 className="text-lg font-semibold text-gray-100">日本株テーマトラッカー</h3>
      <p>
        日本株をテーマ別に分類し、各テーマの騰落率をリアルタイムで追跡できるアプリケーションです。
      </p>
      <div className="space-y-2">
        <h4 className="font-medium text-gray-100">主な機能</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-400">
          <li>テーマ別の騰落率ランキング</li>
          <li>個別銘柄の詳細分析（β、α、R²）</li>
          <li>ローソク足チャート、出来高、RSI表示</li>
          <li>移動平均線、ボリンジャーバンド、一目均衡表</li>
          <li>1年間の推移スパークライン</li>
        </ul>
      </div>
      <p className="text-gray-500 text-xs">
        Version 1.0.0
      </p>
    </div>
  );
}

function PWAContent() {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <h3 className="text-lg font-semibold text-gray-100">ホーム画面に追加</h3>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-100">iPhoneの場合</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-400">
          <li>Safariでこのページを開く</li>
          <li>画面下部の共有ボタン（□に↑）をタップ</li>
          <li>「ホーム画面に追加」を選択</li>
          <li>「追加」をタップ</li>
        </ol>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-100">Androidの場合</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-400">
          <li>Chromeでこのページを開く</li>
          <li>右上のメニュー（︙）をタップ</li>
          <li>「ホーム画面に追加」を選択</li>
          <li>「追加」をタップ</li>
        </ol>
      </div>

      <p className="text-gray-500 text-xs">
        ホーム画面に追加すると、アプリのように素早くアクセスできます。
      </p>
    </div>
  );
}

function QAContent() {
  const faqs = [
    {
      q: 'データはどこから取得していますか？',
      a: 'Yahoo Finance APIを通じて、リアルタイムの株価データを取得しています。',
    },
    {
      q: 'テーマの分類はどのように決めていますか？',
      a: '各テーマは手動で選定した代表的な10銘柄で構成されています。業界トレンドや市場の注目度を考慮して分類しています。',
    },
    {
      q: '騰落率はどのように計算していますか？',
      a: '選択した期間の最初の終値と最新の終値を比較して計算しています。テーマの騰落率は構成銘柄の単純平均です。',
    },
    {
      q: 'β（ベータ）やα（アルファ）の計算基準は？',
      a: 'S&P500などの市場指数ではなく、各テーマの平均騰落率を基準に計算しています。詳しくは「騰落率分析について」をご覧ください。',
    },
    {
      q: 'データの更新頻度は？',
      a: '株価データは取引時間中にリアルタイムで更新されます（15分程度の遅延がある場合があります）。',
    },
  ];

  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-gray-100">よくある質問</h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="space-y-1">
            <h4 className="font-medium text-gray-100">Q: {faq.q}</h4>
            <p className="text-gray-400 pl-4">A: {faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisContent() {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <h3 className="text-lg font-semibold text-gray-100">騰落率分析について</h3>

      <p>
        この機能は、銘柄の値動きを「2つの要因」に分解して表示します。
        S&P500のような市場全体の指数ではなく、各テーマの平均騰落率を基準に計算しています。
      </p>

      <div className="space-y-3 bg-gray-800/50 rounded-lg p-3">
        <h4 className="font-medium text-blue-400 flex items-center gap-2">
          <span>🌊</span> テーマ：業界全体の波に乗った分
        </h4>
        <p className="text-gray-400">
          テーマ全体が上がれば一緒に上がり、下がれば一緒に下がる部分です。
          「β（ベータ）」はその波への感応度を示し、β=1.6ならテーマが1%動いたときに、
          約1.6%動く傾向が見られたことを意味します。
        </p>
      </div>

      <div className="space-y-3 bg-gray-800/50 rounded-lg p-3">
        <h4 className="font-medium text-green-400 flex items-center gap-2">
          <span>💪</span> 個別：その銘柄だけの強さ・弱さ
        </h4>
        <p className="text-gray-400">
          業界の動きとは関係なく、その銘柄固有の要因で生まれたリターンです。
          「α（アルファ）」と呼ばれる傾向的な超過リターンに加え、説明しきれない要因も含みます。
        </p>
      </div>

      <div className="space-y-3 bg-gray-800/50 rounded-lg p-3">
        <h4 className="font-medium text-purple-400 flex items-center gap-2">
          <span>🎯</span> 連動：テーマとの連動性
        </h4>
        <p className="text-gray-400">
          テーマとどれだけ連動しているかを示す指標で、「R²（決定係数）」と呼ばれるものです。
          高いほどテーマとの連動性が大きいことを意味します。
          短期・長期ともに低い（例：50%以下）場合、単一銘柄のみであれば採用が適切でない可能性、
          全銘柄であればテーマのグルーピングが適切でない可能性があります。
        </p>
      </div>

      <div className="space-y-3 bg-gray-800/50 rounded-lg p-3">
        <h4 className="font-medium text-yellow-400 flex items-center gap-2">
          <span>💡</span> 投資判断のヒント
        </h4>
        <ul className="text-gray-400 space-y-1">
          <li>• 「テーマ」要因が大きい → テーマ全体が上昇し、その追い風に強く乗っていた</li>
          <li>• 「個別」要因が大きい → その銘柄独自の強い材料や需給関係があった</li>
          <li>• 「連動」が低い → テーマへの採用が不適切な可能性があります</li>
        </ul>
      </div>

      <div className="space-y-2 bg-red-900/20 border border-red-800/50 rounded-lg p-3">
        <h4 className="font-medium text-red-400">⚠️ 注意</h4>
        <p className="text-gray-400 text-xs">
          本分析は過去の値動きに基づく統計であり、将来の値動きを保証するものではありません。
          特に短期間の数値は統計的に不安定なため、あくまで参考情報としてご覧ください。
        </p>
        <p className="text-gray-400 text-xs">
          また、テーマの平均騰落率には当該銘柄自身も含まれています。
          テーマの構成銘柄数が少ない場合、自分自身との比較の影響が大きくなり、
          βや個別要因の計算が歪む可能性があります。
        </p>
      </div>
    </div>
  );
}

function MarketCapContent() {
  const classifications = [
    {
      name: '超大型 (Mega-cap)',
      threshold: '10兆円以上',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30',
      examples: 'トヨタ、ソニー、キーエンス等',
      description: 'グローバルで競争力を持つ日本を代表する企業群',
    },
    {
      name: '大型 (Large-cap)',
      threshold: '1兆円〜10兆円',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
      examples: 'NTT、任天堂、ファーストリテイリング等',
      description: '各業界のリーディングカンパニー',
    },
    {
      name: '中型 (Mid-cap)',
      threshold: '3000億円〜1兆円',
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      examples: '日経225採用銘柄の多くが該当',
      description: '成長期待と安定性のバランスが取れた企業',
    },
    {
      name: '小型 (Small-cap)',
      threshold: '300億円〜3000億円',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/30',
      examples: '東証プライム・スタンダード上場企業',
      description: '成長ポテンシャルの高いニッチ企業',
    },
    {
      name: '超小型 (Micro-cap)',
      threshold: '300億円未満',
      color: 'text-red-400',
      bgColor: 'bg-red-900/30',
      examples: '東証グロース上場企業等',
      description: 'ハイリスク・ハイリターンの新興企業',
    },
  ];

  return (
    <div className="space-y-4 text-sm text-gray-300">
      <h3 className="text-lg font-semibold text-gray-100">時価総額分類について</h3>

      <p>
        日本株の時価総額に基づく分類です。米国市場の基準を日本市場の規模に合わせて調整しています。
      </p>

      <div className="space-y-3">
        {classifications.map((cap) => (
          <div key={cap.name} className={`${cap.bgColor} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`font-medium ${cap.color}`}>{cap.name}</span>
              <span className="text-xs text-gray-400">{cap.threshold}</span>
            </div>
            <p className="text-xs text-gray-400">{cap.description}</p>
            <p className="text-xs text-gray-500 mt-1">例: {cap.examples}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 bg-gray-800/50 rounded-lg p-3">
        <h4 className="font-medium text-gray-100">参考指標</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• 日経225最小銘柄: 約2000億円程度</li>
          <li>• TOPIX Core30: 10兆円以上の銘柄が中心</li>
          <li>• 東証プライム上場基準: 時価総額100億円以上</li>
        </ul>
      </div>

      <div className="space-y-2 bg-gray-800/50 rounded-lg p-3">
        <h4 className="font-medium text-gray-100">米国との比較</h4>
        <p className="text-xs text-gray-400">
          米国市場では超大型を2000億ドル（約30兆円）以上と定義することが多いですが、
          日本市場は規模が小さいため、10兆円以上を超大型としています。
        </p>
      </div>
    </div>
  );
}

function DisclaimerContent() {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <h3 className="text-lg font-semibold text-gray-100">免責事項</h3>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-100">投資判断について</h4>
        <p className="text-gray-400">
          本アプリケーションで提供される情報は、投資の勧誘を目的としたものではありません。
          投資に関する最終的な判断は、ご自身の責任において行ってください。
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-100">データの正確性</h4>
        <p className="text-gray-400">
          本アプリケーションで表示されるデータは、外部APIから取得したものであり、
          その正確性、完全性、最新性を保証するものではありません。
          データの遅延や誤りが発生する可能性があります。
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-100">損害について</h4>
        <p className="text-gray-400">
          本アプリケーションの利用により生じた損害について、
          開発者は一切の責任を負いません。
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-100 pt-4">知的財産権</h3>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-100">データソース</h4>
        <p className="text-gray-400">
          株価データはYahoo Finance APIを通じて取得しています。
          データの著作権は各情報提供元に帰属します。
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-100">商標について</h4>
        <p className="text-gray-400">
          本アプリケーションで使用されている企業名、銘柄名等は、
          各社の登録商標または商標です。
        </p>
      </div>

      <p className="text-gray-500 text-xs pt-4">
        最終更新日: 2025年1月
      </p>
    </div>
  );
}
