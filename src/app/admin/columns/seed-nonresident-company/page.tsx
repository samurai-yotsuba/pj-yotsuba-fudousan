"use client";

import SeedColumnsRunner from "@/components/admin/SeedColumnsRunner";
import { NONRESIDENT_COMPANY_COLUMN_SEED } from "@/lib/data/nonresident-company-column-seed";

export default function SeedNonresidentCompanyPage() {
  return <SeedColumnsRunner
    heading="非居住者の株式会社設立コラム（1本・4言語）公開"
    description="承認済みの記事を4言語で公開します。銀行関連サービスと追加料金の未承認案は含みません。"
    articles={NONRESIDENT_COMPANY_COLUMN_SEED}
  />;
}
