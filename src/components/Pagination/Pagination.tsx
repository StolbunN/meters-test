import { observer } from "mobx-react-lite";
import { useStore } from "../../store/MetersStore";
import type { PaginationProps } from "./Pagination.props";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button/Button";

export const Pagination = observer(({ className }: PaginationProps) => {

  const rootStore = useStore();
  const pages: (number | string)[] = [];
  const numPages: number[] = [];
  const endPage = rootStore.totalPages;

  if (rootStore.currentPage <= 4 && endPage - rootStore.currentPage > 3) {
    for (let i = 1; i <= 5; i++) {
      pages.push(i);
      numPages.push(i)
    }
    pages.push("...");
    numPages.push(6)

    pages.push(rootStore.totalPages);
    numPages.push(rootStore.totalPages);
  }

  if (rootStore.currentPage > 4 && endPage - rootStore.currentPage > 3) {
    pages.push(1);
    numPages.push(1)

    pages.push("...");
    numPages.push(rootStore.currentPage - 2);
    for (let i = rootStore.currentPage - 1; i <= rootStore.currentPage + 1; i++) {
      pages.push(i);
      numPages.push(i)
    }
    pages.push("...");
    numPages.push(rootStore.currentPage + 2);

    pages.push(rootStore.totalPages);
    numPages.push(rootStore.totalPages);
  }

  if (rootStore.currentPage > 4 && endPage - rootStore.currentPage <= 3) {
    pages.push(1);
    numPages.push(1)

    pages.push("...");
    numPages.push(endPage - 5)
    for (let i = endPage - 4; i <= endPage; i++) {
      pages.push(i);
      numPages.push(i);
    }
  }


  return (
    <div className={cn(className)}>
      {pages.map((p, i) => {
        return (
          <Button key={`${p}${i}`} appearance="pagination" onClick={() => rootStore.setPage(numPages[i])} className={cn(p === rootStore.currentPage && "bg-(--gray-hover)")}>
          {p}
        </Button>
        )
      }
      )}
    </div>
  );
});