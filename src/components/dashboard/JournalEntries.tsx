import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
}

interface JournalEntriesProps {
  entries: JournalEntry[];
  onDelete?: (id: string) => void;
}

const JournalEntries: React.FC<JournalEntriesProps> = ({ entries, onDelete }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No journal entries to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div key={entry.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">{entry.title}</h3>
            <div className="flex items-center gap-2">
              {entry.mood && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  {entry.mood}
                </span>
              )}
              <span className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
              
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this journal entry? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(entry.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-line">{entry.content}</p>
        </div>
      ))}
    </div>
  );
};

export default JournalEntries;
