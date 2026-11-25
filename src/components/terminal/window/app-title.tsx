interface AppTitleProps {
  title: string;
}

export function AppTitle({ title }: AppTitleProps) {
  return <h4 className="text-sm font-bold opacity-90">{title}</h4>;
}
