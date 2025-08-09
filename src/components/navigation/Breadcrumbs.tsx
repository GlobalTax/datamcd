import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";

export interface CrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: CrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  const location = useLocation();

  // Default breadcrumbs based on location
  const segments = location.pathname.split("/").filter(Boolean);
  const autoItems: CrumbItem[] = [
    { label: "Inicio", href: "/" },
    ...segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const label = seg.charAt(0).toUpperCase() + seg.slice(1);
      return { label, href };
    }),
  ];

  const list = items && items.length ? items : autoItems;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          {list.map((item, i) => {
            const isLast = i === list.length - 1;
            const elements = [
              (
                <BreadcrumbItem key={`item-${i}`}>
                  {isLast || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ),
            ];
            if (!isLast) {
              elements.push(<BreadcrumbSeparator key={`sep-${i}`} />);
            }
            return elements;
          })}

        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};

export default Breadcrumbs;
