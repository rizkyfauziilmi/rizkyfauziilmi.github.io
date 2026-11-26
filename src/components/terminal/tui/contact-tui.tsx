import { CONTACT_CHANNELS } from "../data";
import { ContactDetail } from "./contact-detail";
import { ContactList } from "./contact-list";
import { useContactTui } from "./use-contact-tui";

export function ContactTui({ onExit }: { onExit: () => void }) {
  const { selectedIndex, expandedId, selectAt, closeDetail } = useContactTui(
    CONTACT_CHANNELS,
    onExit,
  );
  const expandedChannel = CONTACT_CHANNELS.find(
    (channel) => channel.id === expandedId,
  );

  if (expandedChannel) {
    return <ContactDetail channel={expandedChannel} onBack={closeDetail} />;
  }

  return (
    <ContactList
      channels={CONTACT_CHANNELS}
      selectedIndex={selectedIndex}
      onSelect={selectAt}
      onExit={onExit}
    />
  );
}
