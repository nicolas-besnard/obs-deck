import clsx from "clsx";
import { PropsWithChildren } from "react";
import { Icon, IconType } from "./Icon";

interface ButtonProps {
  isActive?: boolean;
  muted?: boolean;
  bordered?: boolean;
  icon: IconType;
  onClick: () => void;
}

export function Button({
  icon,
  children,
  onClick,
  isActive = false,
  bordered = false,
  muted = false,
}: ButtonProps & PropsWithChildren) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "h-32 w-32 flex flex-col items-center justify-center rounded-md border-2 px-6 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        {
          "bg-indigo-600 text-white ": isActive,
          "bg-slate-700 text-slate-500": !isActive && !muted,
          "border-slate-400 border-dashed border-2": bordered,
          "border-transparent": !bordered,
          "bg-red-700 text-white": muted,
        }
      )}
    >
      <Icon iconType={icon} />
      <span className="">{children}</span>
    </button>
  );
}
