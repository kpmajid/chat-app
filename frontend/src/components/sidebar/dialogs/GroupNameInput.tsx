import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GroupNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

const GroupNameInput = ({ value, onChange }: GroupNameInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="group-name">Group Name</Label>
      <Input
        id="group-name"
        placeholder="Enter group name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default GroupNameInput;
