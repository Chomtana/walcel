import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { getPaginationRange } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const pageRange = getPaginationRange(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent className="flex flex-wrap gap-2.5 justify-center">
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
        </PaginationItem>

        <PaginationItem>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </PaginationItem>

        {pageRange.map((page, i) =>
          typeof page === "number" ? (
            <PaginationItem key={i}>
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            </PaginationItem>
          ) : (
            <PaginationItem key={i}>
              <span className="px-2 text-muted-foreground">...</span>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </PaginationItem>

        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
