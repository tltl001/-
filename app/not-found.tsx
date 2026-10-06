import Link from "next/link";
import { EmptyState, buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <EmptyState>요청한 항목을 찾을 수 없습니다. 삭제되었거나 잘못된 주소일 수 있습니다.</EmptyState>
      <Link href="/" className={`${buttonClass.secondary} mt-6`}>
        대시보드로
      </Link>
    </div>
  );
}
