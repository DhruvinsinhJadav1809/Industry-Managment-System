import { BellRing, Check, Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Select } from "../components/common";
import { AppLayout } from "../layouts/AppLayout";
import type { ApiErrorShape } from "../lib/axios";
import { createNotificationSchema } from "../lib/validations/notificationSchema";
import { notificationService } from "../services/notificationService";
import { userService } from "../services/userService";
import { useToast } from "../context/ToastContext";
import type { UserListItem } from "../types/user";
import {
  NOTIFICATION_TYPES,
  type CreateNotificationPayload,
  type NotificationType,
} from "../types/notification";

const fieldClassName =
  "w-full rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none transition-colors focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:focus:border-amber-400/70";

export default function CreateNotification() {
  const toast = useToast();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("SYSTEM");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const firstPage = await userService.list({
          page: 1,
          pageSize: 100,
          sortBy: "fullName",
          sortOrder: "asc",
        });
        const pages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstPage.data.totalPages - 1) },
            (_, index) =>
              userService.list({
                page: index + 2,
                pageSize: 100,
                sortBy: "fullName",
                sortOrder: "asc",
              }),
          ),
        );
        const allUsers = [firstPage, ...pages].flatMap((page) =>
          page.data.items.filter((user) => user.isActive),
        );
        if (!cancelled) setUsers(allUsers);
      } catch (error) {
        if (!cancelled) setLoadError((error as ApiErrorShape).message);
      } finally {
        if (!cancelled) setIsLoadingUsers(false);
      }
    };

    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
    setErrors((current) => ({ ...current, recipients: "" }));
  };

  const selectAll = () => {
    setSelectedRecipients((current) =>
      current.length === users.length ? [] : users.map((user) => user.id),
    );
    setErrors((current) => ({ ...current, recipients: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const result = createNotificationSchema.safeParse({
      title,
      message,
      type,
      recipients: selectedRecipients,
    });
    if (!result.success) {
      setErrors(
        result.error.issues.reduce<Record<string, string>>(
          (fieldErrors, issue) => {
            fieldErrors[String(issue.path[0])] ??= issue.message;
            return fieldErrors;
          },
          {},
        ),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await notificationService.create(
        result.data as CreateNotificationPayload,
      );
      toast.success("Notification published.");
      setTitle("");
      setMessage("");
      setType("SYSTEM");
      setSelectedRecipients([]);
    } catch (error) {
      setLoadError((error as ApiErrorShape).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allSelected =
    users.length > 0 && selectedRecipients.length === users.length;

  return (
    <AppLayout>
      <div className="mb-7 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-steel-800 text-white dark:bg-amber-400 dark:text-steel-950">
          <BellRing className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
            Publish notification
          </h1>
          <p className="text-sm text-steel-500 dark:text-steel-400">
            Compose an update and choose who receives it.
          </p>
        </div>
      </div>

      {loadError && <Alert variant="error">{loadError}</Alert>}

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
              Title
            </span>
            <input
              className={fieldClassName}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              required
            />
            {errors.title && (
              <span className="text-xs text-red-600">{errors.title}</span>
            )}
          </label>
          <Select
            label="Type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as NotificationType)
            }
            options={NOTIFICATION_TYPES.map((notificationType) => ({
              value: notificationType,
              label: notificationType.replaceAll("_", " "),
            }))}
          />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Message
          </span>
          <textarea
            className={`${fieldClassName} min-h-32 resize-y`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={2000}
            required
          />
          <span className="text-right text-xs text-steel-500">
            {message.length}/2000
          </span>
          {errors.message && (
            <span className="text-xs text-red-600">{errors.message}</span>
          )}
        </label>

        <section aria-labelledby="recipients-heading">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2
                id="recipients-heading"
                className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
              >
                Recipients
              </h2>
              <p className="mt-1 text-xs text-steel-500">
                {selectedRecipients.length} selected
              </p>
            </div>
            <button
              type="button"
              onClick={selectAll}
              disabled={isLoadingUsers || users.length === 0}
              className="text-sm font-semibold text-steel-700 hover:text-steel-950 disabled:opacity-50 dark:text-amber-400 dark:hover:text-amber-300"
            >
              {allSelected ? "Clear selection" : "Select all"}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-md border border-steel-200 bg-white dark:border-steel-700 dark:bg-steel-900">
            {isLoadingUsers ? (
              <p className="p-4 text-sm text-steel-500">
                Loading recipients...
              </p>
            ) : users.length === 0 ? (
              <p className="p-4 text-sm text-steel-500">
                No active users available.
              </p>
            ) : (
              users.map((user) => {
                const checked = selectedRecipients.includes(user.id);
                return (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-steel-100 px-4 py-3 last:border-b-0 hover:bg-steel-50 dark:border-steel-800 dark:hover:bg-steel-800/60"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRecipient(user.id)}
                      className="size-4 accent-steel-800 dark:accent-amber-400"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-steel-800 dark:text-steel-100">
                        {user.fullName}
                      </span>
                      <span className="block truncate text-xs text-steel-500">
                        {user.email}
                      </span>
                    </span>
                    {checked && (
                      <Check
                        className="size-4 text-emerald-600"
                        aria-hidden="true"
                      />
                    )}
                  </label>
                );
              })
            )}
          </div>
          {errors.recipients && (
            <p className="mt-1.5 text-xs text-red-600">{errors.recipients}</p>
          )}
        </section>

        <div className="flex justify-end border-t border-steel-200 pt-5 dark:border-steel-800">
          <Button
            type="submit"
            isLoading={isSubmitting}
            icon={<Send className="size-4" />}
          >
            Publish notification
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
