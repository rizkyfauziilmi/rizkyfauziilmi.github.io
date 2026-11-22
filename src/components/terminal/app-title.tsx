interface AppTitleProps {
  title: string;
}

export function AppTitle({ title }: AppTitleProps) {
  return <h4 className="font-bold text-sm opacity-90">{title}</h4>;
}
