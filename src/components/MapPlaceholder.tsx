
export default function MapPlaceholder() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-slate-100 border border-dashed border-slate-300">
      <div className="text-lg text-muted-foreground px-2 text-center">
        Map goes here.<br />
        <span className="text-xs">
          (TODO: Insert Google Maps or Mapbox. You’ll need to provide an API key.)
        </span>
      </div>
    </div>
  );
}
